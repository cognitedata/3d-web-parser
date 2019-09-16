// Copyright 2019 Cognite AS

import ProtobufDecoder from './ProtobufDecoder';
import Sector from '../../Sector';
import { Vector3 } from 'three';
import { getParentPath } from '../../PathExtractor';
import { InstancedMesh } from '../../geometry/InstancedMeshGroup';
import PrimitiveGroup from '../../geometry/PrimitiveGroup';
import { FilterOptions, ParseData, ParseReturn, SectorMap, sleep } from '../parseUtils';
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

import { createSceneStats } from '../../SceneStats';

import { TreeIndexNodeIdMap, ColorMap } from '../parseUtils';
import { RenderedPrimitiveNameType } from '../../geometry/Types';
import mergeInstancedMeshes from '../../optimizations/mergeInstancedMeshes';
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
  primitiveParsers.forEach(({ parser }) => {
    const group = parser(data);
    if (!group.isEmpty) {
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

  const treeIndexNodeIdMap: TreeIndexNodeIdMap = [];
  const colorMap: ColorMap = [];

  let count = 0;

  const handleSector = async (rawSector: any) => {
    const { boundingBox, path, id } = rawSector;
    const boundingBoxMin = new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);
    const boundingBoxMax = new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z);
    const sector = new Sector(id, boundingBoxMin, boundingBoxMax);
    sectors[path] = sector;

    const { primitiveGroups, mergedMeshGroup, instancedMeshGroup } = parseGeometries({
      geometries: rawSector.geometries,
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
    primitiveGroup.consolidateAndOrderBySize();
    // Sleep to avoid blocking thread
    if (++count % 10 === 0) {
      await sleep(1);
    }
  }

  for (const sector of rootSector.traverseSectorsBreadthFirst()) {
    mergeInstancedMeshes(sector, sceneStats);
  }
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
