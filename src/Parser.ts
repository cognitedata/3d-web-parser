// Copyright 2019 Cognite AS

import ProtobufDecoder from './ProtobufDecoder';
import * as WebSceneProto from './proto/web_scene.json';
import * as THREE from 'three';
import Sector from './Sector';
import { Vector3, Group } from 'three';
import { getParentPath } from './PathExtractor';
import { InstancedMesh, InstancedMeshGroup } from './geometry/InstancedMeshGroup';
import { MergedMesh } from './geometry/MergedMeshGroup';
import PrimitiveGroup from './geometry/PrimitiveGroup';
import GeometryGroup from './geometry/GeometryGroup';

import parseBoxes from './parsers/parseBoxes';
import parseCircles from './parsers/parseCircles';
import parseCones from './parsers/parseCones';
import parseEccentricCones from './parsers/parseEccentricCones';
import parseEllipsoidSegments from './parsers/parseEllipsoidSegments';
import parseGeneralCylinders from './parsers/parseGeneralCylinders';
import parseGeneralRings from './parsers/parseGeneralRings';
import parseNuts from './parsers/parseNuts';
import parseQuads from './parsers/parseQuads';
import parseSphericalSegments from './parsers/parseSphericalSegments';
import parseTorusSegments from './parsers/parseTorusSegments';
import parseTrapeziums from './parsers/parseTrapeziums';
import parseMergedMeshes from './parsers/parseMergedMeshes';
import parseInstancedMeshes from './parsers/parseInstancedMeshes';

import BoxGroup from './geometry/BoxGroup';
import CircleGroup from './geometry/CircleGroup';
import ConeGroup from './geometry/ConeGroup';
import EccentricConeGroup from './geometry/EccentricConeGroup';
import EllipsoidSegmentGroup from './geometry/EllipsoidSegmentGroup';
import GeneralCylinderGroup from './geometry/GeneralCylinderGroup';
import GeneralRingGroup from './geometry/GeneralRingGroup';
import NutGroup from './geometry/NutGroup';
import PlaneGroup from './geometry/PlaneGroup';
import QuadGroup from './geometry/QuadGroup';
import SphericalSegmentGroup from './geometry/SphericalSegmentGroup';
import TorusSegmentGroup from './geometry/TorusSegmentGroup';
import TrapeziumGroup from './geometry/TrapeziumGroup';

import SceneStats from './SceneStats';

import mergeInstancedMeshes from './optimizations/mergeInstancedMeshes';
import { MergedMeshGroup } from './geometry/MergedMeshGroup';
import { PrimitiveGroupMap } from './geometry/PrimitiveGroup';

const primitiveParsers = [
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

interface InstancedMeshMap { [key: number]: InstancedMesh; }

function parseGeometries(geometries: GeometryGroup[],
                         instancedMeshMap: InstancedMeshMap,
                         primitiveGroupMap: PrimitiveGroupMap,
                         sceneStats: SceneStats) {
  const primitiveGroups: PrimitiveGroup[] = [];
  primitiveParsers.forEach(({ type, parser }) => {
    const didCreateNewGroup = parser(geometries, primitiveGroupMap);
    if (didCreateNewGroup) {
      // TODO(anders.hafreager) Learn TypeScript and fix this
      // @ts-ignore
      primitiveGroups.push(primitiveGroupMap[type].group);
    }
  });

  const mergedMeshGroup = parseMergedMeshes(geometries, sceneStats);
  const instancedMeshGroup = parseInstancedMeshes(geometries, instancedMeshMap, sceneStats);

  return { primitiveGroups, mergedMeshGroup, instancedMeshGroup };
}

export default async function parseProtobuf(protobufData: Uint8Array, printParsingTime: boolean = false) {
  const protobufDecoder = new ProtobufDecoder();

  const sectors: { [path: string]: Sector } = { };
  const instancedMeshMap: { [key: number]: InstancedMesh } = {};
  const sceneStats: SceneStats = {
    numInstancedMeshes: 0,
    numMergedMeshes: 0,
  };
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
  let t0 = performance.now();
  for (const webNode of protobufDecoder.decodeWebScene(protobufData)) {
    const { boundingBox, path } = webNode;
    const boundingBoxMin = new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);
    const boundingBoxMax = new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z);
    const sector = new Sector(boundingBoxMin, boundingBoxMax);
    sectors[path] = sector;
    const {
      primitiveGroups,
      mergedMeshGroup,
      instancedMeshGroup,
    } = parseGeometries(webNode.geometries, instancedMeshMap, primitiveGroupMap, sceneStats);

    sector.primitiveGroups = primitiveGroups;
    sector.mergedMeshGroup = mergedMeshGroup;
    sector.instancedMeshGroup = instancedMeshGroup;

    // attach to parent
    const parentPath = getParentPath(path);
    if (parentPath !== undefined) {
      sectors[parentPath].addChild(sector);
      sectors[parentPath].object3d.add(sector.object3d);
    }
  }
  if (printParsingTime) {
    // tslint:disable-next-line
    console.log('Parsing protobuf took ', performance.now() - t0, ' ms.');
  }

  t0 = performance.now();
  const rootSector = sectors['0/'];
  for (const sector of rootSector.traverseSectors()) {
    mergeInstancedMeshes(sector, 2500, sceneStats);
  }
  if (printParsingTime) {
    // tslint:disable-next-line
    console.log('Optimizing instanced meshes took ', performance.now() - t0, ' ms.');
  }

  return { rootSector, sectors, sceneStats };
}
