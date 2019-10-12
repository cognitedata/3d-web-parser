// Copyright 2019 Cognite AS

import { unpackInstancedMeshes, unpackMergedMeshes, unpackPrimitives } from './unpackGeometry/main';
import Sector from '../../Sector';
import CustomFileReader from './CustomFileReader';
import mergeInstancedMeshes from '../../optimizations/mergeInstancedMeshes';
import { SceneStats, createSceneStats } from '../../SceneStats';
import { PerSectorCompressedData, UncompressedValues } from './sharedFileParserTypes';
import { DataMaps, FilterOptions, ParseReturn } from '../parseUtils';
import { BoxGroup, CircleGroup, ConeGroup, PrimitiveGroup } from '../../geometry/GeometryGroups';
import * as THREE from 'three';
//import * as reveal from 'reveal-utils';
const revealModule = import('../../../pkg');

function preloadMeshFiles(meshLoader: any, fileIds: number[]) {
  fileIds.forEach(fileId => {
    meshLoader.getGeometry(fileId);
  });
}

function convertBuffer(name: String, array: Uint8Array): (Uint8Array | Float32Array | Uint32Array ) {
  switch (name) {
    case 'color':
      return array;
    default:
      return new Float32Array(array.buffer);
  };
};

// TODO should be Number[] and not Float32Array!
function setupMaps(group: PrimitiveGroup, maps: DataMaps, colors: Uint8Array, nodeIds: number[]) {
    for (let i = 0; i < group.treeIndex.length; i++) {
      const treeIndex = group.treeIndex[i];
      const nodeId = nodeIds[i];
      console.log("TREE INDEX", treeIndex);
      console.log("NODE ID", nodeId);
      const r = colors[i * 4 + 0] / 255;
      const g = colors[i * 4 + 1] / 255;
      const b = colors[i * 4 + 2] / 255;
      // ignoring a, it's not used by PrimitiveGroup.
      maps.colorMap[treeIndex] = new THREE.Color(r, g, b);
      // @ts-ignore
      maps.nodeIdTreeIndexMap[nodeId] = treeIndex;
      maps.treeIndexNodeIdMap[treeIndex] = nodeId;
    }
}

export async function parseSectorI3D(
  fileBuffer: ArrayBuffer,
) {
  const reveal = await revealModule;
  const rootSector = reveal.parse_root_sector(fileBuffer);
  const sector = reveal.parse_sector(rootSector, fileBuffer);
  const renderableSector = reveal.convert_sector(sector);
  console.log("YES!", renderableSector);
  console.log("BOXES?", renderableSector.box_collection().center());
}

export async function parseSceneI3D(
  fileBuffer: ArrayBuffer,
  filterOptions?: FilterOptions, // TODO handle filterOptions
): Promise<ParseReturn> {
  const reveal = await revealModule;

  const maps: DataMaps = {
    treeIndexNodeIdMap: [],
    colorMap: [],
    nodeIdTreeIndexMap: new Map(),
    sectors: {}
  };

  const scene = reveal.load_i3df(fileBuffer);
  const sectorCount = scene.sector_count();
  console.log("SCENE HELLO", scene);
  for (let i = 0; i < sectorCount; i++) {
    console.log("Loading sector", i);
    const sector_id = scene.sector_id(i);
    const parent_id = scene.sector_parent_id(i);
    const bbox_min = scene.sector_bbox_min(i);
    const bbox_max = scene.sector_bbox_max(i);
    console.log("Bbox", bbox_min, bbox_max);
    const sector = new Sector(sector_id, new THREE.Vector3(bbox_min.x, bbox_min.y, bbox_min.z), new THREE.Vector3(bbox_max.x, bbox_max.y, bbox_max.z));
    const fileSector = scene.sector(i);

    {
      const group = new BoxGroup(0);
      const collection = fileSector.box_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['center'] = collection.center();
      group.data.arrays['size'] = collection.size();
      group.data.arrays['normal'] = collection.normal();
      group.data.arrays['angle'] = collection.rotation_angle();
      group.data.arrays['delta'] = collection.delta();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new CircleGroup(0);
      const collection = fileSector.circle_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['center'] = collection.center();
      group.data.arrays['normal'] = collection.normal();
      group.data.arrays['radiusA'] = collection.radius();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new ConeGroup(0);
      const collection = fileSector.cone_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['centerA'] = collection.center_a();
      group.data.arrays['centerB'] = collection.center_b();
      group.data.arrays['size'] = collection.size();
      group.data.arrays['radiusA'] = collection.radius_a();
      group.data.arrays['radiusB'] = collection.radius_b();
      group.data.arrays['angle'] = collection.angle();
      group.data.arrays['arcAngle'] = collection.arc_angle();
      group.data.arrays['localXAxis'] = collection.local_x_axis();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds);

      group.sort();
      sector.primitiveGroups.push(group);
    }

    if (parent_id !== undefined) {
      const parentSector = maps.sectors[parent_id];
      if (parentSector !== undefined) {
        parentSector.addChild(sector);
        parentSector.object3d.add(sector.object3d);
      } else {
        throw Error('Parent sector not found');
      }
    }

    maps.sectors[sector_id] = sector;
  }
  const rootSector = maps.sectors[scene.root_sector_id];

  //for (const sector of scene.sectors) {
    //for (const primitive_group_name in sector.primitive_groups) {
      //const primitive_group = sector.primitive_groups[primitive_group_name];
      //for (const attribute_name in primitive_group) {
        //if (primitive_group[attribute_name] instanceof Uint8Array) {
          //primitive_group[attribute_name] = convertBuffer(attribute_name, primitive_group[attribute_name]);
        //}
      //}
    //}
  //}

  //const r = scene.root_sector;
  //const rootSector = new Sector(r.id, r.bbox_min, r.bbox_max);
  //const rootSector = new Sector(0, new THREE.Vector3(), new THREE.Vector3());
  //maps.sectors[rootSector.id] = rootSector;
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
