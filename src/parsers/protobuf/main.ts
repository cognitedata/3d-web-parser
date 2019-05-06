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
import { FilterOptions, InstancedMeshMap, ParseData, ParseReturn, SectorMap } from '../parseUtils';
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
type PrimitiveParserMap = { type: RenderedPrimitiveNameType; parser: (data: ParseData) => PrimitiveGroup };

const primitiveParsers: PrimitiveParserMap[] = [
  { type: 'Box', parser: parseBoxes },
  { type: 'Circle', parser: parseCircles },
  { type: 'Cone', parser: parseCones },
  { type: 'EccentricCone', parser: parseEccentricCones },
  { type: 'EllipsoidSegment', parser: parseEllipsoidSegments },
  { type: 'GeneralCylinder', parser: parseGeneralCylinders },
  { type: 'GeneralRing', parser: parseGeneralRings },
  { type: 'Nut', parser: parseNuts },
  { type: 'Quad', parser: parseQuads },
  { type: 'SphericalSegment', parser: parseSphericalSegments },
  { type: 'TorusSegment', parser: parseTorusSegments },
  { type: 'Trapezium', parser: parseTrapeziums }
];

function parseGeometries(data: ParseData) {
  const primitiveGroups: PrimitiveGroup[] = [];
  primitiveParsers.forEach(({ type, parser }) => {
    const group = parser(data);
    if (group.capacity > 0) {
      primitiveGroups.push(group);
    }
  });

  const mergedMeshGroup = parseMergedMeshes(data);
  const instancedMeshGroup = parseInstancedMeshes(data);

  return { primitiveGroups, mergedMeshGroup, instancedMeshGroup };
}

export default function parseProtobuf(
  protobufData?: Uint8Array,
  protobufDataList?: Uint8Array[],
  filterOptions?: FilterOptions
): ParseReturn {
  const protobufDecoder = new ProtobufDecoder();

  const sectors: SectorMap = {};
  const instancedMeshMap: { [key: number]: InstancedMesh } = {};
  const sceneStats = createSceneStats();

  const mergedMeshMap: InstancedMeshMap = {};
  const treeIndexNodeIdMap: TreeIndexNodeIdMap = [];
  const colorMap: ColorMap = [];

  const handleWebNode = (webNode: any) => {
    const { boundingBox, path, id } = webNode;
    const boundingBoxMin = new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);
    const boundingBoxMax = new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z);
    const sector = new Sector(id, boundingBoxMin, boundingBoxMax);
    sectors[path] = sector;

    const { primitiveGroups, mergedMeshGroup, instancedMeshGroup } = parseGeometries({
      geometries: webNode.geometries,
      instancedMeshMap,
      sceneStats,
      treeIndexNodeIdMap,
      colorMap,
      filterOptions
    });

    sector.primitiveGroups = primitiveGroups;
    sector.mergedMeshGroup = mergedMeshGroup;
    sector.instancedMeshGroup = instancedMeshGroup;

    // attach to parent
    const parentPath = getParentPath(path);
    if (parentPath !== undefined) {
      sectors[parentPath].addChild(sector);
      sectors[parentPath].object3d.add(sector.object3d);
    }
  };

  if (protobufData) {
    for (const webNode of protobufDecoder.decodeWebScene(protobufData)) {
      handleWebNode(webNode);
    }
  } else if (protobufDataList) {
    protobufDataList.forEach(data => {
      const webNode = protobufDecoder.decode(ProtobufDecoder.Types.WEB_NODE, data);
      handleWebNode(webNode);
    });
  } else {
    throw new Error('parseProtobuf did not get data to parse');
  }

  const rootSector = sectors['0/'];
  for (const primitiveGroup of rootSector.traversePrimitiveGroups()) {
    primitiveGroup.sort();
  }

  mergeInstancedMeshes(rootSector, sceneStats);
  for (const sector of rootSector.traverseSectors()) {
    sector.mergedMeshGroup.createTreeIndexMap();
    sector.instancedMeshGroup.createTreeIndexMap();

    sceneStats.numSectors++;
    sector.primitiveGroups.forEach(primitiveGroup => {
      sceneStats.geometryCount[primitiveGroup.type] += primitiveGroup.data.count;
    });
  }
  sceneStats.numNodes = treeIndexNodeIdMap.length;

  const nodeIdTreeIndexMap: Map<number, number> = new Map();
  for (let treeIndex = 0; treeIndex < treeIndexNodeIdMap.length; treeIndex++) {
    const nodeId = treeIndexNodeIdMap[treeIndex];
    nodeIdTreeIndexMap.set(nodeId, treeIndex);
  }

  return { rootSector, sceneStats, maps: { colorMap, treeIndexNodeIdMap, nodeIdTreeIndexMap, sectors } };
}
