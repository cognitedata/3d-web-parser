import * as THREE from 'three';
import { InstancedMeshGroup, InstancedMesh, InstancedMeshCollection } from '../geometry/InstancedMeshGroup';
import { MatchingGeometries, parseInstancedMeshTransformMatrix } from './parseUtils';
const globalColor = new THREE.Color();
const globalMatrix = new THREE.Matrix4();

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

function createCollection(node: any) {
  const { triangleCount, triangleOffset } = node;
  const collection = new InstancedMeshCollection(
    triangleOffset,
    triangleCount,
    node.properties.length,
  );
  // @ts-ignore
  node.properties.forEach(property => {
    const nodeId = Number(property.nodeId);
    const { color, treeIndex, transformMatrix } = property;
    globalColor.setHex(color.rgb);
    parseInstancedMeshTransformMatrix(globalMatrix, transformMatrix);
    collection.addMapping(nodeId, treeIndex, globalColor, globalMatrix);
  });
  return collection;
}

export default function parse(geometries: any[],
                              instancedMeshMap: { [key: number]: InstancedMesh }): InstancedMeshGroup {
  const matchingGeometries = findMatchingGeometries(geometries);
  const group = new InstancedMeshGroup();

  matchingGeometries.geometries.forEach(geometry => {
    const fileId = geometry.file[0].fileId;

    const nodes: any[] = geometry.nodes;

    let didCreateNewInstancedMesh = false;
    if (instancedMeshMap[fileId] == null) {
      instancedMeshMap[fileId] = new InstancedMesh(fileId);
      didCreateNewInstancedMesh = true;
    }
    const instancedMesh = instancedMeshMap[fileId];

    nodes.forEach(node => {
      instancedMesh.addCollection(createCollection(node));
    });

    // Only add it to the group if we created a new one. If we didn't,
    // the instanced mesh is on another sector.
    if (didCreateNewInstancedMesh) {
      group.addMesh(instancedMesh);
    }

  });

  return group;
}
