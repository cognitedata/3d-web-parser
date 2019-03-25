import Sector from '../Sector';
import { MergedMesh, MergedMeshMappings } from '../geometry/MergedMeshGroup';
import * as THREE from 'three';
import { InstancedMeshCollection } from '../geometry/InstancedMeshGroup';
import SceneStats from '../SceneStats';
import { TreeIndexNodeIdMap } from '../parsers/parseUtils';

const globalMatrix = new THREE.Matrix4();
const globalColor = new THREE.Color();

function countMappingsToMerge(collections: InstancedMeshCollection[], triangleCountLimit: number) {
  let numMappings = 0;
  collections.forEach(collection => {
    const triangleCount = (collection.mappings.count - 1) * collection.triangleCount;
    if (triangleCount < triangleCountLimit) {
      numMappings += collection.mappings.count;
    }
  });
  return numMappings;
}

export default function mergeInstancedMeshes(
  sector: Sector,
  triangleCountLimit: number,
  sceneStats: SceneStats,
  treeIndexNodeIdMap: TreeIndexNodeIdMap) {
  sector.instancedMeshGroup.meshes.forEach(instancedMesh => {
    const mergedMesh = new MergedMesh(
      countMappingsToMerge(instancedMesh.collections, triangleCountLimit),
      instancedMesh.fileId,
      true,
    );

    for (let index = instancedMesh.collections.length - 1; index >= 0; index--) {
      const collection = instancedMesh.collections[index];
      const triangleCount = (collection.mappings.count - 1) * collection.triangleCount;
      if (triangleCount < triangleCountLimit) {
        for (let i = 0; i < collection.mappings.count; i++) {
          const treeIndex = collection.mappings.getTreeIndex(i);
          const nodeId = treeIndexNodeIdMap[treeIndex];
          collection.mappings.getTransformMatrix(globalMatrix, i);

          mergedMesh.mappings.add(
            collection.triangleOffset,
            collection.triangleCount,
            nodeId,
            treeIndex,
            globalMatrix,
          );
        }

        instancedMesh.collections.splice(index, 1);
      }
    }
    sceneStats.numMergedMeshes += 1;
    sector.mergedMeshGroup.addMesh(mergedMesh);
  });
}
