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

import mergeInstancedMeshes from './optimizations/mergeInstancedMeshes';
import { MergedMeshGroup } from './geometry/MergedMeshGroup';

const primitiveParsers = [
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
];

interface InstancedMeshMap { [key: number]: InstancedMesh; }

function parseGeometries(geometries: GeometryGroup[],
                         instancedMeshMap: InstancedMeshMap) {
  const primitiveGroups: PrimitiveGroup[] = [];
  primitiveParsers.forEach(parser => {
    const group: PrimitiveGroup = parser(geometries);
    if (group.capacity > 0) {
      primitiveGroups.push(group);
    }
  });

  const mergedMeshGroup = parseMergedMeshes(geometries);
  const instancedMeshGroup = parseInstancedMeshes(geometries, instancedMeshMap);

  return { primitiveGroups, mergedMeshGroup, instancedMeshGroup };
}

export default async function parseProtobuf(protobufData: Uint8Array) {
  const protobufDecoder = new ProtobufDecoder();

  const nodes: { [path: string]: Sector } = { };
  const instancedMeshMap: { [key: number]: InstancedMesh } = {};
  const mergedMeshMap: { [key: number]: MergedMesh } = {};
  for (const webNode of protobufDecoder.decodeWebScene(protobufData)) {
    const { boundingBox, path } = webNode;
    const boundingBoxMin = new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);
    const boundingBoxMax = new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z);
    const sector = new Sector(boundingBoxMin, boundingBoxMax);
    nodes[path] = sector;
    const {
      primitiveGroups,
      mergedMeshGroup,
      instancedMeshGroup,
    } = parseGeometries(webNode.geometries, instancedMeshMap);

    sector.primitiveGroups = primitiveGroups;
    sector.mergedMeshGroup = mergedMeshGroup;
    sector.instancedMeshGroup = instancedMeshGroup;

    // attach to parent
    const parentPath = getParentPath(path);
    if (parentPath !== undefined) {
      nodes[parentPath].addChild(sector);
      nodes[parentPath].object3d.add(sector.object3d);
    }
  }

  const rootSector = nodes['0/'];
  for (const sector of rootSector.traverseSectors()) {
    sector.mergedMeshGroup = new MergedMeshGroup();
    mergeInstancedMeshes(sector, 5000);
  }

  // return root sector
  return rootSector;
}
