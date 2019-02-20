import * as THREE from 'three';
import { InstancedMeshGroup, InstancedMesh, InstancedMeshCollection } from '../../geometry/InstancedMeshGroup';
import { CompressedGeometryData, UncompressedValues } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';
import { xAxis, yAxis, zAxis } from './../../constants';
import SceneStats from './../../SceneStats';

const matrix = new THREE.Matrix4();
const rotation = new THREE.Matrix4();
let size = 0;
export default function unpackInstancedMesh(
  group: InstancedMeshGroup,
  geometryInfo: CompressedGeometryData,
  uncompressedValues: UncompressedValues,
  sceneStats: SceneStats,
  treeIndexNodeIdMap: number[],
  colorMap: THREE.Color[]) {

  const data = new PropertyLoader(uncompressedValues);

  const uncompressedMetadata = [];
  for (let i = 0; i < geometryInfo.count; i++) {
    data.loadData(geometryInfo);
    uncompressedMetadata.push({ fileId: data.fileId, triangleOffset: data.triangleOffset,
      triangleCount: data.triangleCount });
  }
  geometryInfo.indexes.rewind();
  geometryInfo.nodeIds.rewind();

  const meshesByFileId: any = {};
  uncompressedMetadata.forEach(mergedMesh => {
    if (meshesByFileId[mergedMesh.fileId] === undefined) {
      meshesByFileId[mergedMesh.fileId] = [];
    }
    if (meshesByFileId[mergedMesh.fileId][mergedMesh.triangleOffset] === undefined) {
      meshesByFileId[mergedMesh.fileId][mergedMesh.triangleOffset] = {
        count: 0, triangleCount: mergedMesh.triangleCount };
      size += 1;
    }

    meshesByFileId[mergedMesh.fileId][mergedMesh.triangleOffset].count += 1;
    if (meshesByFileId[mergedMesh.fileId][mergedMesh.triangleOffset].triangleCount !== mergedMesh.triangleCount) {
      throw Error("Triangle counts don't match");
    }
  });

  const instancedMeshCollections: any = {};
  Object.keys(meshesByFileId).forEach(fileId => {
    instancedMeshCollections[fileId] = {};
    Object.keys(meshesByFileId[fileId]).forEach(triangleOffset => {
      const info = meshesByFileId[fileId][triangleOffset];
      instancedMeshCollections[fileId][triangleOffset] = new InstancedMeshCollection(
        parseInt(triangleOffset, 10),
        info.triangleCount,
        info.count,
      );
    });
  });

  for (let i = 0; i < geometryInfo.count; i++) {
    data.loadData(geometryInfo);
    treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
    colorMap[data.treeIndex] = data.color;
    matrix.identity().setPosition(data.translation);
    matrix.multiply(rotation.makeRotationAxis(zAxis, data.rotation3.z));
    matrix.multiply(rotation.makeRotationAxis(yAxis, data.rotation3.y));
    matrix.multiply(rotation.makeRotationAxis(xAxis, data.rotation3.x));

    matrix.scale(data.scale);
    instancedMeshCollections[data.fileId][data.triangleOffset].addMapping(
      data.nodeId, data.treeIndex, matrix);
  }

  const instancedMeshes: any = {};
  Object.keys(meshesByFileId).forEach(fileId => {
    instancedMeshes[fileId] = new InstancedMesh(parseInt(fileId, 10));
    group.addMesh(instancedMeshes[fileId]);
    sceneStats.numInstancedMeshes += 1;

    Object.keys(meshesByFileId[fileId]).forEach(triangleOffset => {
      instancedMeshes[fileId].addCollection(
        instancedMeshCollections[fileId][triangleOffset]);
    });
  });
  
  console.log(size);
}
