// Copyright 2019 Cognite AS

import {
  DataMaps,
  SectorGeometry,
  InstancedMeshGroup,
  PrimitiveGroup,
  BoxGroup,
  CircleGroup,
  ConeGroup,
  GeneralRingGroup,
  QuadGroup
} from '../..';
import * as THREE from 'three';

const revealModule = import('../../../pkg/reveal_utils');

// TODO 20191015 larsmoa: Workaround because we can't export SectorHandle
// because import is asynchronous
export class WasmSectorHandle {
  readonly handle: any;

  constructor(handle: any) {
    this.handle = handle;
  }

  free() {
    this.handle.free();
  }
}

/**
 * Parses a root sector. Differs from other sectors as this contains lookup values
 * used by all sectors.
 * @param fileBuffer
 */
export async function parseRootSector(fileBuffer: ArrayBuffer): Promise<WasmSectorHandle> {
  const reveal = await revealModule;
  const handle = reveal.parse_root_sector(fileBuffer);
  return new WasmSectorHandle(handle);
}

/**
 * Parses a 'regular' sector and uses the provided root sector to look up values from indices
 * stored in the file buffer.
 * @param rootSector
 * @param fileBuffer
 */
export async function parseSector(rootSector: WasmSectorHandle, fileBuffer: ArrayBuffer): Promise<WasmSectorHandle> {
  const reveal = await revealModule;
  const rootHandle = rootSector.handle;
  const handle = reveal.parse_sector(rootHandle, fileBuffer);
  return new WasmSectorHandle(handle);
}

/**
 * Converts the provided sector handle to a geometry object.
 */
export async function convertSector(sector: WasmSectorHandle): Promise<SectorGeometry> {
  const reveal = await revealModule;
  const sectorHandle = sector.handle;
  const sectorData = reveal.convert_sector(sectorHandle);
  try {
    return convertToGeometry(sectorData);
  } finally {
    sectorData.free();
  }
}

function convertToGeometry(sectorData: any): SectorGeometry {
  const dataMaps: DataMaps = {
    treeIndexNodeIdMap: [],
    colorMap: [],
    nodeIdTreeIndexMap: new Map<number, number>(),
    sectors: {}
  };

  const primitiveGroups = createPrimitiveGroups(sectorData, dataMaps);
  return {
    id: sectorData.id,
    primitiveGroups,
    instancedMeshGroup: new InstancedMeshGroup(),
    dataMaps
  };
}

function createPrimitiveGroups(sector: any, maps: DataMaps): PrimitiveGroup[] {
  const groups: PrimitiveGroup[] = [];
  {
    const group = new BoxGroup(0);
    const collection = sector.box_collection();
    group.treeIndex = collection.tree_index();
    group.data.count = group.treeIndex.length;
    group.data.arrays.center = collection.center();
    group.data.arrays.size = collection.size();
    group.data.arrays.normal = collection.normal();
    group.data.arrays.angle = collection.rotation_angle();
    group.data.arrays.delta = collection.delta();

    const nodeIds = [].slice.call(collection.node_id());
    const colors = collection.color();
    setupMaps(group, maps, colors, nodeIds);

    group.sort();
    groups.push(group);
  }
  {
    const group = new CircleGroup(0);
    const collection = sector.circle_collection();
    group.treeIndex = collection.tree_index();
    group.data.count = group.treeIndex.length;
    group.data.arrays.size = collection.size();
    group.data.arrays.center = collection.center();
    group.data.arrays.normal = collection.normal();
    group.data.arrays.radiusA = collection.radius();

    const nodeIds = [].slice.call(collection.node_id());
    const colors = collection.color();
    setupMaps(group, maps, colors, nodeIds);

    group.sort();
    groups.push(group);
  }
  {
    const group = new ConeGroup(0);
    const collection = sector.cone_collection();
    group.treeIndex = collection.tree_index();
    group.data.count = group.treeIndex.length;
    group.data.arrays.size = collection.size();
    group.data.arrays.centerA = collection.center_a();
    group.data.arrays.centerB = collection.center_b();
    group.data.arrays.radiusA = collection.radius_a();
    group.data.arrays.radiusB = collection.radius_b();
    group.data.arrays.angle = collection.angle();
    group.data.arrays.arcAngle = collection.arc_angle();
    group.data.arrays.localXAxis = collection.local_x_axis();

    const nodeIds = [].slice.call(collection.node_id());
    const colors = collection.color();
    setupMaps(group, maps, colors, nodeIds);

    group.sort();
    groups.push(group);
  }
  {
    const group = new GeneralRingGroup(0);
    const collection = sector.general_ring_collection();
    group.treeIndex = collection.tree_index();
    group.data.count = group.treeIndex.length;
    group.data.arrays.size = collection.size();
    group.data.arrays.center = collection.center();
    group.data.arrays.normal = collection.normal();
    group.data.arrays.localXAxis = collection.local_x_axis();
    group.data.arrays.radiusA = collection.radius_x();
    group.data.arrays.radiusB = collection.radius_y();
    group.data.arrays.thickness = collection.thickness();
    group.data.arrays.angle = collection.angle();
    group.data.arrays.arcAngle = collection.arc_angle();

    const nodeIds = [].slice.call(collection.node_id());
    const colors = collection.color();
    setupMaps(group, maps, colors, nodeIds);

    group.sort();
    groups.push(group);
  }
  {
    const group = new QuadGroup(0);
    const collection = sector.quad_collection();
    group.treeIndex = collection.tree_index();
    group.data.count = group.treeIndex.length;
    group.data.arrays.size = collection.size();
    group.data.arrays.vertex1 = collection.vertex_1();
    group.data.arrays.vertex2 = collection.vertex_2();
    group.data.arrays.vertex3 = collection.vertex_3();

    const nodeIds = [].slice.call(collection.node_id());
    const colors = collection.color();
    setupMaps(group, maps, colors, nodeIds);

    group.sort();
    groups.push(group);
  }
  return groups;
}

// TODO 20191015 larsmoa: Copied from main.ts
function setupMaps(group: PrimitiveGroup, maps: DataMaps, colors: Uint8Array, nodeIds: number[]) {
  for (let i = 0; i < group.treeIndex.length; i++) {
    const treeIndex = group.treeIndex[i];
    const nodeId = nodeIds[i];
    // console.log("TREE INDEX", treeIndex);
    // console.log("NODE ID", nodeId);
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
// const rootSector = reveal.parse_root_sector(fileBuffer);
// const sector = reveal.parse_sector(rootSector, fileBuffer);
// const renderableSector = reveal.convert_sector(sector);
// console.log('YES!', renderableSector);
// console.log('BOXES?', renderableSector.box_collection().center());
