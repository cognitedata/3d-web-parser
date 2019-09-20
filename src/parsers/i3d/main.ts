// Copyright 2019 Cognite AS

import Sector from '../../Sector';
import CustomFileReader from './CustomFileReader';
import { createSceneStats } from '../../SceneStats';
import { PerSectorCompressedData, UncompressedValues } from './sharedFileParserTypes';
import { DataMaps, FilterOptions, ParseReturn } from '../parseUtils';
import GeometryUnpacker from './unpackGeometry/GeometryUnpacker';

export function parseFullCustomFile(fileBuffer: ArrayBuffer, filterOptions?: FilterOptions): ParseReturn {
  const fileReader = new CustomFileReader(fileBuffer);
  const maps: DataMaps = {
    treeIndexNodeIdMap: [],
    colorMap: [],
    nodeIdTreeIndexMap: new Map(),
    sectors: {}
  };
  // Read root sector
  const rootSectorEnd = fileReader.readUint32();
  const rootSectorMetadata = fileReader.readSectorMetadata();
  const uncompressedValues = fileReader.readUncompressedValues();

  const rootSector = new Sector(
    rootSectorMetadata.sectorId,
    rootSectorMetadata.sectorBBoxMin,
    rootSectorMetadata.sectorBBoxMax
  );

  const unpacker = new GeometryUnpacker(maps, uncompressedValues, filterOptions);

  maps.sectors[rootSectorMetadata.sectorId] = rootSector;
  rootSector.setGeometryLoadInformation(unpacker, fileReader, fileReader.location, rootSectorEnd);
  // TODO 20190916 larsmoa: For some reason readCompressedGeometryData reads _past_ rootSectorEnd,
  // hence seek() does not work. Fix this bug.
  fileReader.readCompressedGeometryData(rootSectorEnd);
  // fileReader.seek(rootSectorEnd);

  // Read remaining sectors
  while (fileReader.location < fileBuffer.byteLength) {
    const sectorStartLocation = fileReader.location;
    const sectorEnd = fileReader.readUint32();
    const sectorMetadata = fileReader.readSectorMetadata();
    const sector = new Sector(rootSectorMetadata.sectorId, sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);
    sector.setGeometryLoadInformation(unpacker, fileReader, sectorStartLocation, sectorEnd);
    maps.sectors[sectorMetadata.sectorId] = sector;

    const parentSector = maps.sectors[sectorMetadata.parentSectorId];
    if (parentSector !== undefined) {
      parentSector.addChild(sector);
      parentSector.object3d.add(sector.object3d);
    } else {
      throw Error('Parent sector not found');
    }
    // TODO 20190916 larsmoa: See TODO above.
    fileReader.readCompressedGeometryData(rootSectorEnd);
    // fileReader.seek(sectorEnd);
  }

  // for (const sector of rootSector.traverseSectors()) {
  //   console.log(`Load ${sector.path}...`);
  //   sector.loadGeometry();
  // }
  return unpackData(rootSector, maps);
}

// TODO 20190917 larsmoa: parseMultipleCustomFiles() is used for "partial loads" which
// will be depracated (?) when streaming is in place (or maybe a simple filter)
export function parseMultipleCustomFiles(
  sectorBuffers: ArrayBuffer[],
  meshLoader: any,
  filterOptions?: FilterOptions
): ParseReturn {
  // TODO 20190916 larsmoa: Re-implement parseMultipleCustomFiles()

  const maps: DataMaps = {
    treeIndexNodeIdMap: [],
    colorMap: [],
    nodeIdTreeIndexMap: new Map(),
    sectors: {}
  };
  const compressedData: PerSectorCompressedData = {};
  let uncompressedValues: undefined | UncompressedValues;
  let rootSector: undefined | Sector;

  sectorBuffers.forEach(sectorBuffer => {
    const fileReader = new CustomFileReader(sectorBuffer);
    const sectorByteLength = fileReader.readUint32();
    const sectorMetadata = fileReader.readSectorMetadata();
    const sector = new Sector(sectorMetadata.sectorId, sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);
    maps.sectors[sectorMetadata.sectorId] = sector;

    if (sectorMetadata.arrayCount > 0) {
      // Is root sector
      rootSector = sector;
      uncompressedValues = fileReader.readUncompressedValues();
    } else {
      const parentSector = maps.sectors[sectorMetadata.parentSectorId];
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

  return unpackData(rootSector, maps);
}

function unpackData(rootSector: Sector, maps: DataMaps): ParseReturn {
  const sceneStats = createSceneStats();

  for (const sector of rootSector.traverseSectors()) {
    // sector.mergedMeshGroup.createTreeIndexMap();
    // sector.instancedMeshGroup.createTreeIndexMap();

    sceneStats.numSectors++;
    sector.primitiveGroups.forEach(primitiveGroup => {
      sceneStats.geometryCount[primitiveGroup.type] += primitiveGroup.data.count;
    });
  }
  sceneStats.numNodes = maps.treeIndexNodeIdMap.length;

  for (let treeIndex = 0; treeIndex < maps.treeIndexNodeIdMap.length; treeIndex++) {
    const nodeId = maps.treeIndexNodeIdMap[treeIndex];
    maps.nodeIdTreeIndexMap.set(nodeId, treeIndex);
  }

  return { rootSector, sceneStats, maps };
}
