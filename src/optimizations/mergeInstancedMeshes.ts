// Copyright 2019 Cognite AS

import Sector from '../Sector';
import { MergedMesh, MergedMeshMappings } from '../geometry/MergedMeshGroup';
import * as THREE from 'three';
import { InstancedMeshCollection } from '../geometry/InstancedMeshGroup';
import SceneStats from '../SceneStats';
import { TreeIndexNodeIdMap } from '../parsers/parseUtils';

const globalMatrix = new THREE.Matrix4();

const TRIANGLE_COUNT_LIMIT = 10000;

function countMappingsToMerge(collections: InstancedMeshCollection[]) {
  let numMappings = 0;
  collections.forEach(collection => {
    const triangleCount = collection.mappings.count * collection.triangleCount;
    if (triangleCount < TRIANGLE_COUNT_LIMIT) {
      numMappings += collection.mappings.count;
    }
  });
  return numMappings;
}

export default function mergeInstancedMeshes(
  rootSector: Sector,
  sceneStats: SceneStats,
  treeIndexNodeIdMap: TreeIndexNodeIdMap) {

  for (const sector of rootSector.traverseSectorsBreadthFirst()) {
    sector.instancedMeshGroup.meshes.forEach(instancedMesh => {
      const mergedMesh = new MergedMesh(
        countMappingsToMerge(instancedMesh.collections),
        instancedMesh.fileId,
        true,
      );

      for (let index = instancedMesh.collections.length - 1; index >= 0; index--) {
        const collection = instancedMesh.collections[index];
        const triangleCount = collection.mappings.count * collection.triangleCount;
        if (triangleCount < TRIANGLE_COUNT_LIMIT) {
          for (let i = 0; i < collection.mappings.count; i++) {
            const treeIndex = collection.mappings.getTreeIndex(i);
            const size = collection.mappings.getSize(i);
            collection.mappings.getTransformMatrix(globalMatrix, i);

            mergedMesh.mappings.add(
              collection.triangleOffset,
              collection.triangleCount,
              treeIndex,
              size,
              globalMatrix,
            );
          }

          instancedMesh.collections.splice(index, 1);
        }
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
