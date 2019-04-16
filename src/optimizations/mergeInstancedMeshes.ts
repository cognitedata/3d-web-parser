// Copyright 2019 Cognite AS

import Sector from '../Sector';
import { MergedMesh } from '../geometry/MergedMeshGroup';
import * as THREE from 'three';
import SceneStats from '../SceneStats';

const globalMatrix = new THREE.Matrix4();

const TRIANGLE_COUNT_LIMIT = 10000;
type MappingInfo = {collectionIndex: number, mappingIndex: number, size: number};

export default function mergeInstancedMeshes(
  rootSector: Sector,
  sceneStats: SceneStats) {

  for (const sector of rootSector.traverseSectorsBreadthFirst()) {
    // for each instanced mesh object with a given fileId
    sector.instancedMeshGroup.meshes.forEach(instancedMesh => {
      // Get all small instanced mesh collections, sorted by size
      const smallCollections = instancedMesh.collections.filter(
        collection => (collection.mappings.count * collection.triangleCount <= TRIANGLE_COUNT_LIMIT));
      const mappingsSortedBySize: MappingInfo[] = [];
      smallCollections.forEach((collection, collectionIndex) => {
        for (let i = 0; i < collection.mappings.capacity; i++) {
          mappingsSortedBySize.push({
            collectionIndex: collectionIndex, mappingIndex: i, size: collection.mappings.getSize(i) });
        }
      });
      mappingsSortedBySize.sort((a: MappingInfo, b: MappingInfo) => a.size - b.size);

      // Create a new merged mesh
      const smallCollectionsTriangleCount = smallCollections.reduce((acc, collection) =>
        acc + collection.mappings.count, 0);
      const mergedMesh = new MergedMesh(
        smallCollectionsTriangleCount,
        instancedMesh.fileId,
        true,
      );

      // Move the instanced meshes into one merged mesh, sorted by size
      mappingsSortedBySize.forEach(mappingInfo => {
        const { collectionIndex, mappingIndex } =  mappingInfo;
        const collection = smallCollections[collectionIndex];
        const treeIndex = collection.mappings.getTreeIndex(mappingIndex);
        const size = collection.mappings.getSize(mappingIndex);
        collection.mappings.getTransformMatrix(globalMatrix, mappingIndex);
        mergedMesh.mappings.add(
          collection.triangleOffset,
          collection.triangleCount,
          treeIndex,
          size,
          globalMatrix,
        );
      });
      smallCollections.forEach(collection => {
        instancedMesh.collections.splice(instancedMesh.collections.indexOf(collection), 1);
      });
      sceneStats.geometryCount.MergedMesh += 1;
      sector.mergedMeshGroup.addMesh(mergedMesh);
    });

    for (let i = sector.instancedMeshGroup.meshes.length - 1; i >= 0; i--) {
      if (sector.instancedMeshGroup.meshes[i].collections.length === 0) {
        sector.instancedMeshGroup.meshes.splice(i, 1);
      }
    }
  }
}
