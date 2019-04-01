import * as THREE from 'three';
import { InstancedMesh, InstancedMeshCollection, InstancedMeshGroup } from '../../geometry/InstancedMeshGroup';
import { PerSectorCompressedData, UncompressedValues } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';
import { xAxis, yAxis, zAxis } from './../../constants';
import SceneStats from './../../SceneStats';
import Sector from './../../Sector';
import { DataMaps } from './../../parsers/parseUtils';

const matrix = new THREE.Matrix4();
const rotation = new THREE.Matrix4();

export default function unpackInstancedMeshes(
  rootSector: Sector,
  uncompressedValues: UncompressedValues,
  compressedData: PerSectorCompressedData,
  maps: DataMaps,
  sceneStats: SceneStats,
  ) {

  const data = new PropertyLoader(uncompressedValues);

  for (const sector of rootSector!.traverseSectors()) {
    sector.instancedMeshGroup = new InstancedMeshGroup();
    const meshCounts: {[fileId: string]: {[triangleOffset: string]: { count: number, triangleCount: number }}} = {};

    // Count meshes per file Id and triangle offset
    const geometryInfo = compressedData[sector.path].instancedMesh;
    if (geometryInfo !== undefined) {
      for (let i = 0; i < geometryInfo.count; i++) {
        data.loadData(geometryInfo);
        meshCounts[data.fileId] = meshCounts[data.fileId] ? meshCounts[data.fileId] : {};
        meshCounts[data.fileId][data.triangleOffset] = meshCounts[data.fileId][data.triangleOffset] ?
          meshCounts[data.fileId][data.triangleOffset] : { count: 0, triangleCount: data.triangleCount };
        meshCounts[data.fileId][data.triangleOffset].count++;
      }
      geometryInfo.indices.rewind();
      geometryInfo.nodeIds.rewind();
    }

    // Create mesh collections for each file Id and triangle offset
    const collections: {[fileId: string]: {[triangleOffset: string]: InstancedMeshCollection}} = {};
    Object.keys(meshCounts).forEach(fileId => {
      collections[fileId] = collections[fileId] ? collections[fileId] : {};
      Object.keys(meshCounts[fileId]).forEach(triangleOffset => {
        const { count, triangleCount } = meshCounts[fileId][triangleOffset];
        collections[fileId][triangleOffset] = new InstancedMeshCollection(
          parseInt(triangleOffset, 10), triangleCount, count);
      });
    });

    // Fill mesh collections with matrix data
    if (geometryInfo !== undefined) {
      for (let i = 0; i < geometryInfo.count; i++) {
        data.loadData(geometryInfo);
        maps.treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
        maps.colorMap[data.treeIndex] = data.color;
        matrix.identity().setPosition(data.translation);
        matrix.multiply(rotation.makeRotationAxis(zAxis, data.rotation3.z));
        matrix.multiply(rotation.makeRotationAxis(yAxis, data.rotation3.y));
        matrix.multiply(rotation.makeRotationAxis(xAxis, data.rotation3.x));
        matrix.scale(data.scale);
        collections[data.fileId][data.triangleOffset].addMapping(
          data.nodeId, data.treeIndex, matrix);
      }
    }

    // Add collections to sector group
    Object.keys(collections).forEach(fileId => {
      const instancedMesh = new InstancedMesh(parseInt(fileId, 10));
      Object.keys(collections[fileId]).forEach(triangleOffset => {
        instancedMesh.addCollection(collections[fileId][triangleOffset]);
      });
      sector.instancedMeshGroup.addMesh(instancedMesh);
      sceneStats.numInstancedMeshes += 1;
    });
  }
}
