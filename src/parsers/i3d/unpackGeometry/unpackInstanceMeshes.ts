import { InstancedMeshCollection, InstancedMeshGroup, InstancedMesh } from '../../../geometry/InstancedMeshGroup';
import PropertyLoader from '../PropertyLoader';
import { DataMaps } from '../../..';
import { CompressedGeometryData } from '../sharedFileParserTypes';
import * as THREE from 'three';
import { zAxis, yAxis, xAxis } from '../../../constants';

export function unpackInstancedMeshes(
  data: PropertyLoader,
  maps: DataMaps,
  geometryInfo: CompressedGeometryData
): InstancedMeshGroup {
  const instancedMeshGroup = new InstancedMeshGroup();

  // Count meshes for each file Id and triangle offset
  const meshCounts = countMeshes(geometryInfo, data);

  // Create mesh collections for each file Id and triangle offset
  const collections = createMeshCollections(meshCounts);

  // Fill mesh collections with matrix data
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Matrix4();
  for (let i = 0; i < geometryInfo.count; i++) {
    data.loadData(geometryInfo);
    maps.treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
    maps.colorMap[data.treeIndex] = data.color;
    matrix.identity().setPosition(data.translation);
    matrix.multiply(rotation.makeRotationAxis(zAxis, data.rotation3.z));
    matrix.multiply(rotation.makeRotationAxis(yAxis, data.rotation3.y));
    matrix.multiply(rotation.makeRotationAxis(xAxis, data.rotation3.x));
    matrix.scale(data.scale);
    collections[data.fileId][data.triangleOffset].addMapping(data.nodeId, data.treeIndex, data.size, matrix);
  }

  // Add collections to sector group
  Object.keys(collections).forEach(fileId => {
    const instancedMesh = new InstancedMesh(parseInt(fileId, 10));
    Object.keys(collections[fileId]).forEach(triangleOffset => {
      instancedMesh.addCollection(collections[fileId][triangleOffset]);
    });
    instancedMeshGroup.addMesh(instancedMesh);
  });
  return instancedMeshGroup;
}

function createMeshCollections(meshCounts: {
  [fileId: string]: {
    [triangleOffset: string]: {
      count: number;
      triangleCount: number;
    };
  };
}) {
  const collections: {
    [fileId: string]: {
      [triangleOffset: string]: InstancedMeshCollection;
    };
  } = {};
  Object.keys(meshCounts).forEach(fileId => {
    collections[fileId] = collections[fileId] !== undefined ? collections[fileId] : {};
    Object.keys(meshCounts[fileId]).forEach(triangleOffset => {
      const { count, triangleCount } = meshCounts[fileId][triangleOffset];
      collections[fileId][triangleOffset] = new InstancedMeshCollection(
        parseInt(triangleOffset, 10),
        triangleCount,
        count
      );
    });
  });
  return collections;
}

function countMeshes(geometryInfo: CompressedGeometryData, data: PropertyLoader) {
  const meshCounts: {
    [fileId: string]: {
      [triangleOffset: string]: {
        count: number;
        triangleCount: number;
      };
    };
  } = {};
  // TODO 20190916 larsmoa: Entire buffer is read to determine number of meshes
  for (let i = 0; i < geometryInfo.count; i++) {
    data.loadData(geometryInfo);
    const [fileId, triangleOffset] = [data.fileId, data.triangleOffset];
    meshCounts[fileId] = meshCounts[fileId] ? meshCounts[fileId] : {};
    meshCounts[fileId][triangleOffset] = meshCounts[fileId][triangleOffset]
      ? meshCounts[fileId][triangleOffset]
      : { count: 0, triangleCount: data.triangleCount };
    meshCounts[fileId][triangleOffset].count++;
  }
  geometryInfo.indices.rewind();
  geometryInfo.nodeIds.rewind();
  return meshCounts;
}
