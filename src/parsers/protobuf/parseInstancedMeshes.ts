// Copyright 2019 Cognite AS

import * as THREE from 'three';
import { InstancedMeshGroup, InstancedMesh, InstancedMeshCollection } from '../../geometry/InstancedMeshGroup';
import { MatchingGeometries, parseInstancedMeshTransformMatrix } from './protobufUtils';
import SceneStats from '../../SceneStats';
import { ParseData } from '../parseUtils';
import { Scene } from 'three';
const globalColor = new THREE.Color();
const globalMatrix = new THREE.Matrix4();
let hasWarnedAboutMissingColor = false;

function findMatchingGeometries(geometries: any[]): MatchingGeometries {
  const matchingGeometries: MatchingGeometries = {
    count: 0,
    geometries: [],
  };

  geometries.forEach(geometry => {
    if (geometry.type === 'triangleMesh' && geometry.isInstanced) {
      matchingGeometries.geometries.push(geometry);
      matchingGeometries.count += 1;
    }
  });

  return matchingGeometries;
}

function createCollection(
  node: any,
  data: ParseData) {
  const { triangleCount, triangleOffset } = node;
  const collection = new InstancedMeshCollection(
    triangleOffset,
    triangleCount,
    node.properties.length,
  );
  // @ts-ignore
  node.properties.forEach(property => {
    const nodeId = Number(property.nodeId);
    const { treeIndex, transformMatrix } = property;
    if (property.color == null && !hasWarnedAboutMissingColor) {
      hasWarnedAboutMissingColor = true;
      console.warn(
        '3d-web-parser encountered node with missing color while loading',
        '(using #ff00ff to highlight objects with missing color).',
      );
    }
    const color = property.color == null ? property.color : { rgb: 0xff00ff };
    globalColor.setHex(color.rgb);
    parseInstancedMeshTransformMatrix(globalMatrix, transformMatrix);
    collection.addMapping(nodeId, treeIndex, globalMatrix);

    data.treeIndexNodeIdMap[treeIndex] = nodeId;
    data.colorMap[treeIndex] = globalColor.clone();
  });
  return collection;
}

export default function parse(data: ParseData): InstancedMeshGroup {
  const matchingGeometries = findMatchingGeometries(data.geometries);
  const group = new InstancedMeshGroup();

  matchingGeometries.geometries.forEach(geometry => {
    const fileId = geometry.file[0].fileId;

    const nodes: any[] = geometry.nodes;

    let didCreateNewInstancedMesh = false;
    if (data.instancedMeshMap[fileId] == null) {
      data.instancedMeshMap[fileId] = new InstancedMesh(fileId);
      didCreateNewInstancedMesh = true;
    }
    const instancedMesh = data.instancedMeshMap[fileId];

    nodes.forEach(node => {
      instancedMesh.addCollection(createCollection(node, data));
    });

    // Only add it to the group if we created a new one. If we didn't,
    // the instanced mesh is on another sector.
    if (didCreateNewInstancedMesh) {
      data.sceneStats.geometryCount.InstancedMesh += 1;
      group.addMesh(instancedMesh);
    }

  });

  return group;
}
