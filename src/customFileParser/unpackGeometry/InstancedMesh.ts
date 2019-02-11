import * as THREE from 'three';
import { InstancedMeshGroup, InstancedMesh, InstancedMeshCollection } from '../../geometry/InstancedMeshGroup';
import { GeometryIndexHandler } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';

const matrix = new THREE.Matrix4();

export default function unpackInstancedMesh(geometryInfo: GeometryIndexHandler, uncompressedValues: any) {
  const data = new PropertyLoader(uncompressedValues);

  const triangleProperties = [];
  for (let i = 0; i < geometryInfo.count; i++) {
    data.loadData(geometryInfo);
    triangleProperties.push({ fileId: data.fileId, triangleOffset: data.triangleOffset,
      triangleCount: data.triangleCount });
  }
  geometryInfo.indexes.rewind();
  geometryInfo.nodeIds.rewind();

  const allFileIds: any = {};
  triangleProperties.forEach(triangle => {
    if (allFileIds[triangle.fileId] === undefined) {
      allFileIds[triangle.fileId] = [];
    }
    if (allFileIds[triangle.fileId][triangle.triangleOffset] === undefined) {
      allFileIds[triangle.fileId][triangle.triangleOffset] = { count: 0, triangleCount: data.triangleCount };
    }

    allFileIds[triangle.fileId][triangle.triangleOffset].count += 1;
  });

  const instancedMeshCollections: any = {};
  Object.keys(allFileIds).forEach(fileId => {
    instancedMeshCollections[fileId] = {};
    Object.keys(allFileIds[fileId]).forEach(triangleOffset => {
      const info = allFileIds[fileId][triangleOffset];
      instancedMeshCollections[fileId][triangleOffset] = new InstancedMeshCollection(
        parseInt(triangleOffset, 10),
        info.triangleCount,
        info.count,
      );
    });
  });

  for (let i = 0; i < geometryInfo.count; i++) {
    data.loadData(geometryInfo);
    instancedMeshCollections[data.fileId][data.triangleOffset].addMapping(
      data.nodeId, data.treeIndex, data.color, matrix);
  }

  const instancedMeshes: any = {};
  Object.keys(allFileIds).forEach(fileId => {
    instancedMeshes[fileId] = new InstancedMesh(parseInt(fileId, 10));
    Object.keys(allFileIds[fileId]).forEach(triangleOffset => {
      instancedMeshes[fileId].addCollection(
        instancedMeshCollections[fileId][triangleOffset]);
    });
  });

  const group = new InstancedMeshGroup();
  Object.keys(instancedMeshes).forEach(fileId => {
    group.addMesh(instancedMeshes[fileId]);
  });

  return group;
}
