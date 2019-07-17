// Copyright 2019 Cognite AS

import ProtobufDecoder from './ProtobufDecoder';
import * as WebSceneProto from './proto/web_scene.json';
import * as THREE from 'three';
import Sector from '../../Sector';
import { Vector3, Group } from 'three';
import { getParentPath } from '../../PathExtractor';
import { InstancedMesh, InstancedMeshGroup } from '../../geometry/InstancedMeshGroup';
import { MergedMesh } from '../../geometry/MergedMeshGroup';
import PrimitiveGroup from '../../geometry/PrimitiveGroup';
import GeometryGroup from '../../geometry/GeometryGroup';
import { FilterOptions, InstancedMeshMap, ParseData, ParseReturn, SectorMap, sleep } from '../parseUtils';
import {
  parseBoxes,
  parseCircles,
  parseCones,
  parseEccentricCones,
  parseEllipsoidSegments,
  parseGeneralCylinders,
  parseGeneralRings,
  parseNuts,
  parseQuads,
  parseSphericalSegments,
  parseTorusSegments,
  parseTrapeziums,
  parseMergedMeshes,
  parseInstancedMeshes
} from './parsers';

import {
  BoxGroup,
  CircleGroup,
  ConeGroup,
  EccentricConeGroup,
  EllipsoidSegmentGroup,
  GeneralCylinderGroup,
  GeneralRingGroup,
  NutGroup,
  QuadGroup,
  SphericalSegmentGroup,
  TorusSegmentGroup,
  TrapeziumGroup
} from '../../geometry/GeometryGroups';

import { SceneStats, createSceneStats } from '../../SceneStats';

import mergeInstancedMeshes from '../../optimizations/mergeInstancedMeshes';
import { TreeIndexNodeIdMap, ColorMap } from '../parseUtils';
import { RenderedPrimitiveNameType } from '../../geometry/Types';
type PrimitiveParserMap = {
  type: RenderedPrimitiveNameType;
  parser: (data: ParseData) => PrimitiveGroup;
  geometryGroup: PrimitiveGroup;
};

const primitiveParsers: PrimitiveParserMap[] = [
  { type: 'Box', parser: parseBoxes, geometryGroup: new BoxGroup(500000) },
  { type: 'Circle', parser: parseCircles, geometryGroup: new CircleGroup(500000) },
  { type: 'Cone', parser: parseCones, geometryGroup: new ConeGroup(500000) },
  { type: 'EccentricCone', parser: parseEccentricCones, geometryGroup: new EccentricConeGroup(500000) },
  { type: 'EllipsoidSegment', parser: parseEllipsoidSegments, geometryGroup: new EllipsoidSegmentGroup(500000) },
  { type: 'GeneralCylinder', parser: parseGeneralCylinders, geometryGroup: new GeneralCylinderGroup(500000) },
  { type: 'GeneralRing', parser: parseGeneralRings, geometryGroup: new GeneralRingGroup(500000) },
  { type: 'Nut', parser: parseNuts, geometryGroup: new NutGroup(500000) },
  { type: 'Quad', parser: parseQuads, geometryGroup: new QuadGroup(500000) },
  { type: 'SphericalSegment', parser: parseSphericalSegments, geometryGroup: new SphericalSegmentGroup(500000) },
  { type: 'TorusSegment', parser: parseTorusSegments, geometryGroup: new TorusSegmentGroup(500000) },
  { type: 'Trapezium', parser: parseTrapeziums, geometryGroup: new TrapeziumGroup(500000) }
];

function parseGeometries(data: ParseData) {
  const primitiveGroups: PrimitiveGroup[] = [];
  primitiveParsers.forEach(({ type, parser, geometryGroup }) => {
    data.geometryGroup = geometryGroup;
    const group = parser(data);
    if (group.capacity > 0) {
      primitiveGroups.push(group);
    }
  });

  const mergedMeshGroup = parseMergedMeshes(data);
  const instancedMeshGroup = parseInstancedMeshes(data);

  return { primitiveGroups, mergedMeshGroup, instancedMeshGroup };
}

export default async function parseProtobuf(
  protobufData: Uint8Array | Uint8Array[],
  filterOptions?: FilterOptions
): Promise<ParseReturn> {
  const protobufDecoder = new ProtobufDecoder();

  const sectors: SectorMap = {};
  const instancedMeshMap: { [key: number]: InstancedMesh } = {};
  const sceneStats = createSceneStats();

  const mergedMeshMap: InstancedMeshMap = {};
  const treeIndexNodeIdMap: TreeIndexNodeIdMap = [];
  const colorMap: ColorMap = [];

  let count = 0;

  const handleSector = async (rawSector: any) => {
    const { boundingBox, path, id } = rawSector;
    const boundingBoxMin = new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);
    const boundingBoxMax = new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z);
    const sector = new Sector(id, boundingBoxMin, boundingBoxMax);
    sectors[path] = sector;

    // @ts-ignore
    const { primitiveGroups, mergedMeshGroup, instancedMeshGroup } = parseGeometries({
      geometries: rawSector.geometries,
      instancedMeshMap,
      sceneStats,
      treeIndexNodeIdMap,
      colorMap,
      filterOptions
    });

    // sector.primitiveGroups = primitiveGroups;
    sector.mergedMeshGroup = mergedMeshGroup;
    sector.instancedMeshGroup = instancedMeshGroup;

    // attach to parent
    const parentPath = getParentPath(path);
    if (parentPath !== undefined) {
      sectors[parentPath].addChild(sector);
      sectors[parentPath].object3d.add(sector.object3d);
    } else {
      sector.primitiveGroups = primitiveParsers.map(parser => parser.geometryGroup);
    }

    // Sleep to avoid blocking thread
    if (++count % 10 === 0) {
      await sleep(1);
    }
  };

  if (protobufData instanceof Array) {
    for (const data of protobufData) {
      const webNode = protobufDecoder.decode(ProtobufDecoder.Types.WEB_NODE, data);
      await handleSector(webNode);
    }
  } else {
    for (const webNode of protobufDecoder.decodeWebScene(protobufData)) {
      await handleSector(webNode);
    }
  }

  const rootSector = sectors['0/'];
  for (const primitiveGroup of rootSector.traversePrimitiveGroups()) {
    primitiveGroup.sort();
    // Sleep to avoid blocking thread
    if (++count % 10 === 0) {
      await sleep(1);
    }
  }

  mergeInstancedMeshes(rootSector, sceneStats);
  for (const sector of rootSector.traverseSectors()) {
    sector.mergedMeshGroup.createTreeIndexMap();
    sector.instancedMeshGroup.createTreeIndexMap();

    sceneStats.numSectors++;
    sector.primitiveGroups.forEach(primitiveGroup => {
      sceneStats.geometryCount[primitiveGroup.type] += primitiveGroup.data.count;
    });
    // Sleep to avoid blocking thread
    if (++count % 10 === 0) {
      await sleep(1);
    }
  }
  sceneStats.numNodes = treeIndexNodeIdMap.length;

  const nodeIdTreeIndexMap: Map<number, number> = new Map();
  for (let treeIndex = 0; treeIndex < treeIndexNodeIdMap.length; treeIndex++) {
    const nodeId = treeIndexNodeIdMap[treeIndex];
    nodeIdTreeIndexMap.set(nodeId, treeIndex);
  }

  return { rootSector, sceneStats, maps: { colorMap, treeIndexNodeIdMap, nodeIdTreeIndexMap, sectors } };
}
