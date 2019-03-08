import { unpackInstancedMeshes, unpackMergedMeshes, unpackPrimitives } from './unpackGeometry/main';
import Sector from './../Sector';
import CustomFileReader from './CustomFileReader';
import SceneStats from './../SceneStats';
import { CompressedGeometryData } from './sharedFileParserTypes';

function preloadMeshFiles(meshLoader: any, fileIds: number[]) {
  fileIds.forEach(fileId => {
    meshLoader.getGeometry(fileId);
  });
}

export default async function parseCustomFile(fileBuffer: ArrayBuffer, meshLoader: any) {
  const fileReader = new CustomFileReader(fileBuffer);
  const idToSectorMap: {[name: string]: Sector} = {};
  const sceneStats: SceneStats = {
    numInstancedMeshes: 0,
    numMergedMeshes: 0,
  };
  const mergedMeshMap: any = {};
  const treeIndexNodeIdMap: number[] = [];
  const colorMap: THREE.Color[] = [];
  let rootSector = undefined;
  let uncompressedValues = undefined;
  const sectorPathToPrimitiveData: {[path: string]: CompressedGeometryData[]} = {};
  const sectorPathToInstancedMeshData: {[path: string]: CompressedGeometryData} = {};
  const sectorPathToMergedMeshData: {[path: string]: CompressedGeometryData} = {};

  while (fileReader.location < fileBuffer.byteLength) {
    const sectorStartLocation = fileReader.location;
    const sectorByteLength = fileReader.readUint32();
    const sectorMetadata = fileReader.readSectorMetadata(sectorByteLength);
    const sector = new Sector(sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);
    idToSectorMap[sectorMetadata.sectorId] = sector;

    if (rootSector === undefined || uncompressedValues === undefined) {
      rootSector = sector;
      uncompressedValues = fileReader.readUncompressedValues();
      preloadMeshFiles(meshLoader, uncompressedValues.fileId!);
    } else {
      const parentSector = idToSectorMap[sectorMetadata.parentSectorId];
      if (parentSector !== undefined) {
        parentSector.addChild(sector);
        parentSector.object3d.add(sector.object3d);
      } else { throw Error('Parent sector not found'); }
    }
    const compressedGeometryData = fileReader.readCompressedGeometryData(sectorStartLocation + sectorByteLength);
    sectorPathToPrimitiveData[sector.path] = compressedGeometryData.primitives;
    if (compressedGeometryData.instancedMesh) {
      sectorPathToInstancedMeshData[sector.path] = compressedGeometryData.instancedMesh;
    }
    if (compressedGeometryData.mergedMesh) {
      sectorPathToMergedMeshData[sector.path] = compressedGeometryData.mergedMesh;
    }
  }

  unpackPrimitives(rootSector!, uncompressedValues!, sectorPathToPrimitiveData,
    treeIndexNodeIdMap, colorMap);
  unpackInstancedMeshes(rootSector!, uncompressedValues!, sectorPathToInstancedMeshData, sceneStats,
    treeIndexNodeIdMap, colorMap);
  unpackMergedMeshes(rootSector!, uncompressedValues!, sectorPathToMergedMeshData, sceneStats,
    treeIndexNodeIdMap, colorMap);

  const sectors = idToSectorMap;
  const nodeIdTreeIndexMap: {[s: number]: number} = {};
  for (let treeIndex = 0; treeIndex < treeIndexNodeIdMap.length; treeIndex++) {
    const nodeId = treeIndexNodeIdMap[treeIndex];
    nodeIdTreeIndexMap[nodeId] = treeIndex;
  }

  return { rootSector, sectors, sceneStats, maps: { colorMap, treeIndexNodeIdMap, nodeIdTreeIndexMap } };
}
