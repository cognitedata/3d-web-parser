// Copyright 2019 Cognite AS

import { unpackInstancedMeshes, unpackMergedMeshes, unpackPrimitives } from './unpackGeometry/main';
import Sector from '../../Sector';
import CustomFileReader from './CustomFileReader';
import mergeInstancedMeshes from '../../optimizations/mergeInstancedMeshes';
import { SceneStats, createSceneStats } from '../../SceneStats';
import { PerSectorCompressedData, UncompressedValues } from './sharedFileParserTypes';
import { DataMaps, FilterOptions, ParseReturn } from '../parseUtils';
//import * as reveal from 'reveal-utils';
const revealModule = import('reveal-utils');

function preloadMeshFiles(meshLoader: any, fileIds: number[]) {
  fileIds.forEach(fileId => {
    meshLoader.getGeometry(fileId);
  });
}

export async function parseSceneI3D(
  fileBuffer: ArrayBuffer,
  filterOptions?: FilterOptions, // TODO handle filterOptions
): Promise<ParseReturn> {
  const reveal = await revealModule;

  const scene = reveal.load_i3df(fileBuffer);

  for (const sector of scene.sectors) {
    console.log("SECTOR", sector);
    for (const [name, values] of sector.primitive_groups) {
      switch (name) {
        case 'color':
          sector.primitive_groups[name] = new Uint8Array(values.buffer);
          break;
        case 'diagonal':
          sector.primitive_groups[name] = new Float32Array(values.buffer);
          break;
      //- name: center_x
        //type: f32
      //- name: center_y
        //type: f32
      //- name: center_z
        //type: f32
      //- name: normal
        //type: f32
        //count: 3
      //- name: delta
        //type: f32
      //- name: height
        //type: f32
      //- name: radius
        //type: f32
      //- name: angle
        //type: f32
      //- name: translation_x
        //type: f32
      //- name: translation_y
        //type: f32
      //- name: translation_z
        //type: f32
      //- name: scale_x
        //type: f32
      //- name: scale_y
        //type: f32
      //- name: scale_z
        //type: f32
      //- name: file_id
        //type: u64
            //- name: texture
      }
    }
  }

  console.log("SCENE", scene);
  const r = scene.root_sector;
  const rootSector = new Sector(r.id, r.bbox_min, r.bbox_max);
  const maps: DataMaps = {
    treeIndexNodeIdMap: [],
    colorMap: [],
    nodeIdTreeIndexMap: new Map(),
    sectors: {}
  };
  maps.sectors[rootSector.id] = rootSector;
  return {
    rootSector,
    sceneStats: createSceneStats(),
    maps,
  };
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
    sectors: {}
  };
  const compressedData: PerSectorCompressedData = {};

  // Read root sector
  const rootSectorLength = fileReader.readUint32();
  const rootSectorMetadata = fileReader.readSectorMetadata();
  const rootSector = new Sector(
    rootSectorMetadata.sectorId,
    rootSectorMetadata.sectorBBoxMin,
    rootSectorMetadata.sectorBBoxMax
  );
  maps.sectors[rootSectorMetadata.sectorId] = rootSector;
  const uncompressedValues = fileReader.readUncompressedValues();
  compressedData[rootSector.path] = fileReader.readCompressedGeometryData(rootSectorLength);

  // Read remaining sectors
  while (fileReader.location < fileBuffer.byteLength) {
    const sectorStartLocation = fileReader.location;
    const sectorByteLength = fileReader.readUint32();
    const sectorMetadata = fileReader.readSectorMetadata();
    const sector = new Sector(rootSectorMetadata.sectorId, sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);
    maps.sectors[sectorMetadata.sectorId] = sector;

    const parentSector = maps.sectors[sectorMetadata.parentSectorId];
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

  for (let treeIndex = 0; treeIndex < maps.treeIndexNodeIdMap.length; treeIndex++) {
    const nodeId = maps.treeIndexNodeIdMap[treeIndex];
    maps.nodeIdTreeIndexMap.set(nodeId, treeIndex);
  }

  return { rootSector, sceneStats, maps };
}
