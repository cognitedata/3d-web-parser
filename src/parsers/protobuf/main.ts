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
import { FilterOptions, InstancedMeshMap, ParseData } from '../parseUtils';
import { parseBoxes,
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
         parseInstancedMeshes } from './parsers';

import { BoxGroup,
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
         TrapeziumGroup } from '../../geometry/GeometryGroups';

import { SceneStats, createSceneStats } from '../../SceneStats';

import mergeInstancedMeshes from '../../optimizations/mergeInstancedMeshes';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';
import { TreeIndexNodeIdMap, ColorMap } from '../parseUtils';
import { GeometryType } from '../../geometry/Types';
type PrimitiveParserMap = {type: GeometryType, parser: (data: ParseData) => boolean };

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
  { type: 'Trapezium', parser: parseTrapeziums },
];

function parseGeometries(data: ParseData) {
  const primitiveGroups: PrimitiveGroup[] = [];
  primitiveParsers.forEach(({ type, parser }) => {
    const count = data.primitiveGroupMap[type].group.data.count;
    const didCreateNewGroup = parser(data);

    if (didCreateNewGroup) {
      primitiveGroups.push(data.primitiveGroupMap[type].group);
    }
  });

  const mergedMeshGroup = parseMergedMeshes(data);
  const instancedMeshGroup = parseInstancedMeshes(data);

  return { primitiveGroups, mergedMeshGroup, instancedMeshGroup };
}

export default async function parseProtobuf(
  protobufData?: Uint8Array,
  protobufDataList?: Uint8Array[],
  filterOptions?: FilterOptions,
) {
  const protobufDecoder = new ProtobufDecoder();

  const sectors: { [path: string]: Sector } = { };
  const instancedMeshMap: { [key: number]: InstancedMesh } = {};
  const sceneStats = createSceneStats();
  // Create map since we will reuse primitive groups until the count is above some threshold.
  // This reduces the number of draw calls.
  const primitiveGroupMap: PrimitiveGroupMap = {
    Box: { capacity: 5000, group: new BoxGroup(0) },
    Circle: { capacity: 5000, group: new CircleGroup(0) },
    Cone: { capacity: 5000, group: new ConeGroup(0) },
    EccentricCone: { capacity: 5000, group: new EccentricConeGroup(0) },
    EllipsoidSegment: { capacity: 5000, group: new EllipsoidSegmentGroup(0) },
    GeneralCylinder: { capacity: 5000, group: new GeneralCylinderGroup(0) },
    GeneralRing: { capacity: 5000, group: new GeneralRingGroup(0) },
    Nut: { capacity: 5000, group: new NutGroup(0) },
    Quad: { capacity: 5000, group: new QuadGroup(0) },
    SphericalSegment: { capacity: 5000, group: new SphericalSegmentGroup(0) },
    TorusSegment: { capacity: 5000, group: new TorusSegmentGroup(0) },
    Trapezium: { capacity: 5000, group: new TrapeziumGroup(0) },
  };

  const mergedMeshMap: InstancedMeshMap = {};
  const treeIndexNodeIdMap: TreeIndexNodeIdMap = [];
  const colorMap: ColorMap = [];

  const handleWebNode = (webNode: any) => {
    const { boundingBox, path } = webNode;
    const boundingBoxMin = new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);
    const boundingBoxMax = new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z);
    const sector = new Sector(boundingBoxMin, boundingBoxMax);
    sectors[path] = sector;

    const {
      primitiveGroups,
      mergedMeshGroup,
      instancedMeshGroup,
    } = parseGeometries({
      primitiveGroupMap,
      geometries: webNode.geometries,
      instancedMeshMap,
      sceneStats,
      treeIndexNodeIdMap,
      colorMap,
      filterOptions,
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
      const webNode = protobufDecoder.decode(
        ProtobufDecoder.Types.WEB_NODE,
        data,
      );
      handleWebNode(webNode);
    });
  } else {
    throw 'parseProtobuf did not get data to parse';
  }

  const rootSector = sectors['0/'];
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

  return { rootSector, sectors, sceneStats, maps: { colorMap, treeIndexNodeIdMap, nodeIdTreeIndexMap } };
}
