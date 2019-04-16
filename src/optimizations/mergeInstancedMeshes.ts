// Copyright 2019 Cognite AS

import Sector from '../Sector';
import { MergedMesh } from '../geometry/MergedMeshGroup';
import * as THREE from 'three';
import SceneStats from '../SceneStats';
import { InstancedMeshCollectionSizeSorter } from '../optimizations/meshSorters';

const globalMatrix = new THREE.Matrix4();

const TRIANGLE_COUNT_LIMIT = 10000;

export default function mergeInstancedMeshes(
  rootSector: Sector,
  sceneStats: SceneStats) {

  for (const sector of rootSector.traverseSectorsBreadthFirst()) {
    // for each instanced mesh object with a given fileId
    sector.instancedMeshGroup.meshes.forEach(instancedMesh => {
      // Get all small instanced mesh collections, sorted by size
      const smallCollections = instancedMesh.collections.filter(
        collection => (collection.mappings.count * collection.triangleCount <= TRIANGLE_COUNT_LIMIT));
      const collectionSorter = new InstancedMeshCollectionSizeSorter(smallCollections);

      // Preallocate memory for a new merged mesh
      const smallCollectionsTriangleCount = smallCollections.reduce((acc, collection) =>
        acc + collection.mappings.count, 0);
      const mergedMesh = new MergedMesh(
        smallCollectionsTriangleCount,
        instancedMesh.fileId,
        true,
      );

      // Move the instanced meshes into one merged mesh, sorted by size
      while (collectionSorter.isNotEmpty()) {
        const { collection, mappingIndex } = collectionSorter.getNext();
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

        const collectionIndex = instancedMesh.collections.indexOf(collection);
        instancedMesh.collections.splice(collectionIndex, 1);
      }
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
