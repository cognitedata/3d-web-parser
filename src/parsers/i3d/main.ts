// Copyright 2019 Cognite AS

import { unpackInstancedMeshes, unpackMergedMeshes, unpackPrimitives } from './unpackGeometry/main';
import Sector from '../../Sector';
import CustomFileReader from './CustomFileReader';
import mergeInstancedMeshes from '../../optimizations/mergeInstancedMeshes';
import { SceneStats, createSceneStats } from '../../SceneStats';
import { PerSectorCompressedData, UncompressedValues } from './sharedFileParserTypes';
import { DataMaps, FilterOptions, ParseReturn } from '../parseUtils';

function preloadMeshFiles(meshLoader: any, fileIds: number[]) {
  fileIds.forEach(fileId => {
    meshLoader.getGeometry(fileId);
  });
}

export function parseFullCustomFile(
  fileBuffer: ArrayBuffer,
  meshLoader: any,
  filterOptions?: FilterOptions
): ParseReturn {
  const fileReader = new CustomFileReader(fileBuffer);
  const maps: DataMaps = {
    treeIndexNodeIdMap: [],
    colorMap: [],
    nodeIdTreeIndexMap: new Map(),
    idToSectorMap: {}
  };
  const compressedData: PerSectorCompressedData = {};

  // Read root sector
  const rootSectorLength = fileReader.readUint32();
  const rootSectorMetadata = fileReader.readSectorMetadata();
  const rootSector = new Sector(rootSectorMetadata.sectorBBoxMin, rootSectorMetadata.sectorBBoxMax);
  maps.idToSectorMap[rootSectorMetadata.sectorId] = rootSector;
  const uncompressedValues = fileReader.readUncompressedValues();
  compressedData[rootSector.path] = fileReader.readCompressedGeometryData(rootSectorLength);

  // Read remaining sectors
  while (fileReader.location < fileBuffer.byteLength) {
    const sectorStartLocation = fileReader.location;
    const sectorByteLength = fileReader.readUint32();
    const sectorMetadata = fileReader.readSectorMetadata();
    const sector = new Sector(sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);
    maps.idToSectorMap[sectorMetadata.sectorId] = sector;

    const parentSector = maps.idToSectorMap[sectorMetadata.parentSectorId];
    if (parentSector !== undefined) {
      parentSector.addChild(sector);
      parentSector.object3d.add(sector.object3d);
    } else {
      throw Error('Parent sector not found');
    }
    compressedData[sector.path] = fileReader.readCompressedGeometryData(sectorStartLocation + sectorByteLength);
  }

  return unpackData(rootSector, uncompressedValues, compressedData, maps, filterOptions);
}

export function parseMultipleCustomFiles(
  sectorBuffers: ArrayBuffer[],
  meshLoader: any,
  filterOptions?: FilterOptions
): ParseReturn {
  const maps: DataMaps = {
    treeIndexNodeIdMap: [],
    colorMap: [],
    nodeIdTreeIndexMap: new Map(),
    idToSectorMap: {}
  };
  const compressedData: PerSectorCompressedData = {};
  let uncompressedValues: undefined | UncompressedValues;
  let rootSector: undefined | Sector;

  sectorBuffers.forEach(sectorBuffer => {
    const fileReader = new CustomFileReader(sectorBuffer);
    const sectorByteLength = fileReader.readUint32();
    const sectorMetadata = fileReader.readSectorMetadata();
    const sector = new Sector(sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);
    maps.idToSectorMap[sectorMetadata.sectorId] = sector;

    if (sectorMetadata.arrayCount > 0) {
      // Is root sector
      rootSector = sector;
      uncompressedValues = fileReader.readUncompressedValues();
    } else {
      const parentSector = maps.idToSectorMap[sectorMetadata.parentSectorId];
      if (parentSector !== undefined) {
        parentSector.addChild(sector);
      } else {
        throw Error('Did not find parent sector');
      }
    }

    compressedData[sector.path] = fileReader.readCompressedGeometryData(sectorByteLength);
  });

  if (rootSector === undefined || uncompressedValues === undefined) {
    throw Error('Did not find root sector');
  }

  return unpackData(rootSector, uncompressedValues, compressedData, maps, filterOptions);
}

function unpackData(
  rootSector: Sector,
  uncompressedValues: UncompressedValues,
  compressedData: PerSectorCompressedData,
  maps: DataMaps,
  filterOptions?: FilterOptions
): ParseReturn {
  const sceneStats = createSceneStats();
  unpackPrimitives(rootSector, uncompressedValues, compressedData, maps, filterOptions);
  unpackMergedMeshes(rootSector, uncompressedValues, compressedData, maps, sceneStats);
  unpackInstancedMeshes(rootSector, uncompressedValues, compressedData, maps, sceneStats);
  mergeInstancedMeshes(rootSector, sceneStats);
  for (const sector of rootSector.traverseSectors()) {
    sector.mergedMeshGroup.createTreeIndexMap();
    sector.instancedMeshGroup.createTreeIndexMap();

    sceneStats.numSectors++;
    sector.primitiveGroups.forEach(primitiveGroup => {
      sceneStats.geometryCount[primitiveGroup.type] += primitiveGroup.data.count;
    });
  }
  sceneStats.numNodes = maps.treeIndexNodeIdMap.length;

  const sectors = maps.idToSectorMap;
  for (let treeIndex = 0; treeIndex < maps.treeIndexNodeIdMap.length; treeIndex++) {
    const nodeId = maps.treeIndexNodeIdMap[treeIndex];
    maps.nodeIdTreeIndexMap.set(nodeId, treeIndex);
  }

  return { rootSector, sectors, sceneStats, maps };
}
