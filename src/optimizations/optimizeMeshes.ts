import Sector from '../Sector';
import { MergedMesh, MergedMeshMappings } from '../geometry/MergedMeshGroup';
import * as THREE from 'three';
import { InstancedMeshCollection } from '../geometry/InstancedMeshGroup';
import SceneStats from '../SceneStats';
import { TreeIndexNodeIdMap } from '../parsers/parseUtils';
import { Scene } from 'three';

const globalMatrix = new THREE.Matrix4();

const TRIANGLE_COUNT_LIMIT = 2500;

function countTriangles(sector: Sector) {
  const instancedMeshes: {[fileId: string]: {[triangleOffset: string]: number}} = {};
  const mergedMeshes: {[fileId: string]: number} = {};
  sector.instancedMeshGroup.meshes.forEach(mesh => {
    instancedMeshes[mesh.fileId] = instancedMeshes[mesh.fileId] ? instancedMeshes[mesh.fileId] : {};
    mesh.collections.forEach(collection => {
      instancedMeshes[mesh.fileId][collection.triangleOffset] =
        (collection.mappings.count - 1) * collection.triangleCount;
    });
  });

  sector.mergedMeshGroup.meshes.forEach(mesh => {
    if (mesh.mappings.triangleCounts.length > 0) {
      mergedMeshes[mesh.fileId] = mesh.mappings.triangleCounts.reduce((a, b) => a + b);
    }
  });

  return { instancedMeshes, mergedMeshes };
}

export function meshStatusReport(rootSector: Sector) {
  const instancedMeshCounts: {[fileId: string]: {[sectorPath: string]:
    {[triangleOffset: string]: number}}} = {};
  const mergedMeshCounts: {[fileId: string]: {[sectorPath: string]: number}} = {};
  const perSectorBreakdown: {[sectorPath: string]: {
    instancedMeshes: {[fileId: string]: {[triangleOffset: string]: number}},
    mergedMeshes: {[fileId: string]: number},
  }} = {};

  for (const sector of rootSector.traverseSectors()) {
    const triangeCount = countTriangles(sector);
    perSectorBreakdown[sector.path] = triangeCount;
    Object.keys(triangeCount.instancedMeshes).map((fileId: string) => {
      instancedMeshCounts[fileId] = instancedMeshCounts[fileId] ? instancedMeshCounts[fileId] : {};
      instancedMeshCounts[fileId][sector.path] = triangeCount.instancedMeshes[fileId];
    });
    Object.keys(triangeCount.mergedMeshes).map((fileId: string) => {
      mergedMeshCounts[fileId] = mergedMeshCounts[fileId] ? mergedMeshCounts[fileId] : {};
      mergedMeshCounts[fileId][sector.path] = triangeCount.mergedMeshes[fileId];
    });
  }

  return { instancedMeshCounts, mergedMeshCounts, perSectorBreakdown };
}

const triangleCountLimit = 5000;
function countMappingsToMerge(collections: InstancedMeshCollection[]) {
  let numMappings = 0;
  collections.forEach(collection => {
    // const triangleCount = (collection.mappings.count - 1) * collection.triangleCount;
    // if (triangleCount < triangleCountLimit) {
    numMappings += collection.mappings.count;
    // }
  });
  return numMappings;
}

function createMergedMeshes(
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
        const triangleCount = (collection.mappings.count - 1) * collection.triangleCount;
        // if (triangleCount < triangleCountLimit) {
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
        // }
      }
      sceneStats.numMergedMeshes += 1;
      sector.mergedMeshGroup.addMesh(mergedMesh);
    });

    for (let i = sector.instancedMeshGroup.meshes.length - 1; i >= 0; i--) {
      if (sector.instancedMeshGroup.meshes[i].collections.length === 0) {
        sector.instancedMeshGroup.meshes.splice(i, 1);
      }
    }
  }
}

export function optimizeMeshes(
  rootSector: Sector,
  sceneStats: SceneStats,
  treeIndexNodeIdMap: TreeIndexNodeIdMap) {
  createMergedMeshes(rootSector, sceneStats, treeIndexNodeIdMap);
}

function instancedMeshesByFileIdAndSectorPath(rootSector: Sector) {
  const meshes: any = {};
  for (const sector of rootSector.traverseSectors()) {
    sector.instancedMeshGroup.meshes.forEach((instancedMesh, index) => {
      meshes[instancedMesh.fileId] = meshes[instancedMesh.fileId] ? meshes[instancedMesh.fileId] : {};
      meshes[instancedMesh.fileId][sector.path] = instancedMesh;
    });
  }
  return meshes;
}
/*
function groupInstancedMeshes(
  rootSector: Sector,
  sceneStats: SceneStats,
  treeIndexNodeIdmap: TreeIndexNodeIdMap) {
  const meshCounts = meshStatusReport(rootSector);
  const instancedMeshMap = instancedMeshesByFileIdAndSectorPath(rootSector);
  Object.keys(meshCounts.instancedMeshCounts).forEach(fileId => {
    Object.keys(meshCounts.instancedMeshCounts[fileId]).forEach(triangleOffset => {

      for (const sector of rootSector.traverseSectorsBreadthFirst()) {
        const anyMeshesLeft = meshCounts.instancedMeshCounts[fileId][sector.path][triangleOffset];
        if (anyMeshesLeft !== undefined && anyMeshesLeft !== 0) {
          let runningTriangleSum = 0;
          const newGroupMeshes = [];
          for (const subSector of sector.traverseSectorsBreadthFirst()) {
            const subSectorTriangleCount = meshCounts.instancedMeshCounts[fileId][subSector.path][triangleOffset];
            if (subSectorTriangleCount !== undefined && subSectorTriangleCount !== 0 &&
              runningTriangleSum + subSectorTriangleCount <= TRIANGLE_COUNT_LIMIT) {
              newGroupMeshes.push([instancedMeshMap[fileId][subSector.path]);
              runningTriangleSum += subSectorTriangleCount;
              meshCounts.instancedMeshCounts[fileId][subSector.path][triangleOffset] = 0;
            }
          }

          if (newGroupMeshes.length > 0) {
            const mergedMesh = new MergedMesh(
              runningTriangleSum,
              parseInt(fileId, 10),
              true,
            );

            newGroupMeshes.forEach(instancedMesh => {
              for (let index = instancedMesh.collections.length - 1; index >= 0; index--) {
                const collection = instancedMesh.collections[index];
                for (let i = 0; i < collection.mappings.count; i++) {
                  const treeIndex = collection.mappings.getTreeIndex(i);
                  const nodeId = treeIndexNodeIdMap[treeIndex];
                  collection.mappings.getTransformMatrix(globalMatrix, i);

                  mergedMesh.mappings.add(
                    parseInt(triangleOffset, 10),
                    collection.triangleCount,
                    nodeId,
                    treeIndex,
                    globalMatrix,
                  );

                  instancedMesh.collections.splice(index, 1);
                }
              }
            });

            sceneStats.numMergedMeshes += 1;
            sector.mergedMeshGroup.addMesh(mergedMesh);
          }
        }
      }
    });
  });

  for (const sector of rootSector.traverseSectors()) {
    for (let i = sector.instancedMeshGroup.meshes.length - 1; i >= 0; i--) {
      if (sector.instancedMeshGroup.meshes[i].collections.length === 0) {
        sector.instancedMeshGroup.meshes.splice(i, 1);
      }
    }
  }
}
*/
