import { unpackFilePrimitive, unpackInstancedMesh, unpackMergedMesh } from './unpackGeometry/main';
import Sector from './../Sector';
import { CompressedGeometryData, UncompressedValues }
  from './sharedFileParserTypes';
import CustomFileReader from './CustomFileReader';
import SceneStats from './../SceneStats';
import { MergedMeshGroup } from '../geometry/MergedMeshGroup';
import { InstancedMeshGroup } from '../geometry/InstancedMeshGroup';
import mergeInstancedMeshes from './../optimizations/mergeInstancedMeshes';

function unpackData(
  sector: Sector,
  uncompressedValues: UncompressedValues,
  sectorPathToGeometryData: {[path: string]: {[name: string]: CompressedGeometryData[]}},
  sceneStats: SceneStats,
  treeIndexNodeIdMap: number[],
  colorMap: THREE.Color[]): Sector {

  const compressedGeometryData = sectorPathToGeometryData[sector.path];
  // Unpack primitives
  compressedGeometryData.primitives.forEach(primitiveCompressedData => {
    unpackFilePrimitive(sector, primitiveCompressedData, uncompressedValues, treeIndexNodeIdMap, colorMap);
  });

  // Unpack meshes
  sector.mergedMeshGroup = new MergedMeshGroup();
  sector.instancedMeshGroup = new InstancedMeshGroup();
  compressedGeometryData.meshes.forEach(meshCompressedData => {
    if (meshCompressedData.type === 'InstancedMesh') {
      unpackInstancedMesh(sector.instancedMeshGroup, meshCompressedData, uncompressedValues,
        sceneStats, treeIndexNodeIdMap, colorMap);
    } else if (meshCompressedData.type === 'MergedMesh') {
      unpackMergedMesh(sector.mergedMeshGroup, meshCompressedData, uncompressedValues,
       sceneStats, treeIndexNodeIdMap, colorMap);
      mergeInstancedMeshes(sector, 2500, sceneStats, treeIndexNodeIdMap);
    }
  });
  sector.instancedMeshGroup.createTreeIndexMap();
  sector.mergedMeshGroup.createTreeIndexMap();

  return sector;
}

export default function parseCustomFile(fileBuffer: ArrayBuffer) {
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
  const sectorPathToGeometryData: any = {};
  while (fileReader.location < fileBuffer.byteLength) {
    const sectorStartLocation = fileReader.location;
    const sectorByteLength = fileReader.readUint32();
    const sectorMetadata = fileReader.readSectorMetadata(sectorByteLength);
    const sector = new Sector(sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);
    idToSectorMap[sectorMetadata.sectorId] = sector;

    if (rootSector === undefined || uncompressedValues === undefined) {
      rootSector = sector;
      uncompressedValues = fileReader.readUncompressedValues();
    } else {
      const parentSector = idToSectorMap[sectorMetadata.parentSectorId];
      if (parentSector !== undefined) {
        parentSector.addChild(sector);
        parentSector.object3d.add(sector.object3d);
      } else { throw Error('Parent sector not found'); }
    }
    const compressedGeometryData = fileReader.readCompressedGeometryData(sectorStartLocation + sectorByteLength);
    sectorPathToGeometryData[sector.path] = compressedGeometryData;
  }

  for (const sector of rootSector!.traverseSectors()) {
    unpackData(sector, uncompressedValues!, sectorPathToGeometryData, sceneStats,
      treeIndexNodeIdMap, colorMap);
  }

  const sectors = idToSectorMap;
  const nodeIdTreeIndexMap: {[s: number]: number} = {};
  for (let treeIndex = 0; treeIndex < treeIndexNodeIdMap.length; treeIndex++) {
    const nodeId = treeIndexNodeIdMap[treeIndex];
    nodeIdTreeIndexMap[nodeId] = treeIndex;
  }

  return { rootSector, sectors, sceneStats, maps: { colorMap, treeIndexNodeIdMap, nodeIdTreeIndexMap } };
}
