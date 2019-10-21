// Copyright 2019 Cognite AS

import { unpackInstancedMeshes, unpackMergedMeshes, unpackPrimitives } from './unpackGeometry/main';
import Sector from '../../Sector';
import CustomFileReader from './CustomFileReader';
import mergeInstancedMeshes from '../../optimizations/mergeInstancedMeshes';
import { SceneStats, createSceneStats } from '../../SceneStats';
import { PerSectorCompressedData, UncompressedValues } from './sharedFileParserTypes';
import { DataMaps, FilterOptions, ParseReturn } from '../parseUtils';
import { BoxGroup, CircleGroup, ConeGroup, EccentricConeGroup, EllipsoidSegmentGroup, GeneralCylinderGroup, GeneralRingGroup, NutGroup, PrimitiveGroup, QuadGroup, SphericalSegmentGroup, TorusSegmentGroup, TrapeziumGroup } from '../../geometry/GeometryGroups';
import { MergedMesh, MergedMeshGroup } from '../../geometry/MergedMeshGroup';
import { InstancedMesh, InstancedMeshGroup, InstancedMeshCollection, InstancedMeshMappings } from '../../geometry/InstancedMeshGroup';
import { xAxis, yAxis, zAxis } from '../../constants';
import GeometryGroup from '../../geometry/GeometryGroup';
import * as THREE from 'three';
//import * as reveal from 'reveal-utils';
const revealModule = import('../../../pkg');

const matrix = new THREE.Matrix4();
const rotation = new THREE.Matrix4();
const rotation3 = new THREE.Vector3();
const translation3 = new THREE.Vector3();
const scale3 = new THREE.Vector3();

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
function setupMaps(group: GeometryGroup, maps: DataMaps, colors: Uint8Array, nodeIds: Float64Array, treeIndexes: Float32Array) {
    for (let i = 0; i < treeIndexes.length; i++) {
      const treeIndex = treeIndexes[i];
      const nodeId = nodeIds[i];
      //console.log("TREE INDEX", treeIndex);
      //console.log("NODE ID", nodeId);
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
  console.log("PARSE SCENE I3D");

  const reveal = await revealModule;

  const maps: DataMaps = {
    treeIndexNodeIdMap: [],
    colorMap: [],
    nodeIdTreeIndexMap: new Map(),
    sectors: {}
  };

  console.log("LOAD I3DF");
  const scene = reveal.load_i3df(fileBuffer);
  console.log("DONE LOADING I3DF");
  const stats = scene.statistics();
  console.log(stats.collections.box_collection);
  //throw 1;
  console.log("COPYING DATA");
  const sectorCount = scene.sector_count();
  //console.log("SCENE HELLO", scene);
  for (let i = 0; i < sectorCount; i++) {
    //console.log("Loading sector", i);
    const sector_id = scene.sector_id(i);
    const parent_id = scene.sector_parent_id(i);
    const bbox_min = scene.sector_bbox_min(i);
    const bbox_max = scene.sector_bbox_max(i);
    //console.log("Bbox", bbox_min, bbox_max);
    const sector = new Sector(sector_id, new THREE.Vector3(bbox_min[0], bbox_min[1], bbox_min[2]), new THREE.Vector3(bbox_max[0], bbox_max[1], bbox_max[2]));
    //console.log("SECTOR", sector.min.clone(), sector.max.clone());
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
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

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
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new ConeGroup(0);
      const collection = fileSector.cone_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['centerA'] = collection.center_a();
      group.data.arrays['centerB'] = collection.center_b();
      group.data.arrays['radiusA'] = collection.radius_a();
      group.data.arrays['radiusB'] = collection.radius_b();
      group.data.arrays['angle'] = collection.angle();
      group.data.arrays['arcAngle'] = collection.arc_angle();
      group.data.arrays['localXAxis'] = collection.local_x_axis();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new EccentricConeGroup(0);
      const collection = fileSector.eccentric_cone_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['centerA'] = collection.center_a();
      group.data.arrays['centerB'] = collection.center_b();
      group.data.arrays['radiusA'] = collection.radius_a();
      group.data.arrays['radiusB'] = collection.radius_b();
      group.data.arrays['normal'] = collection.normal();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new EllipsoidSegmentGroup(0);
      const collection = fileSector.ellipsoid_segment_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['center'] = collection.center();
      group.data.arrays['normal'] = collection.normal();
      group.data.arrays['hRadius'] = collection.horizontal_radius();
      group.data.arrays['vRadius'] = collection.vertical_radius();
      group.data.arrays['height'] = collection.height();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new GeneralCylinderGroup(0);
      const collection = fileSector.general_cylinder_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['centerA'] = collection.center_a();
      group.data.arrays['centerB'] = collection.center_b();
      group.data.arrays['radiusA'] = collection.radius();
      group.data.arrays['heightA'] = collection.height_a();
      group.data.arrays['heightB'] = collection.height_b();
      group.data.arrays['slopeA'] = collection.slope_a();
      group.data.arrays['slopeB'] = collection.slope_b();
      group.data.arrays['zAngleA'] = collection.z_angle_a();
      group.data.arrays['zAngleB'] = collection.z_angle_b();
      group.data.arrays['angle'] = collection.angle();
      group.data.arrays['planeA'] = collection.plane_a();
      group.data.arrays['planeB'] = collection.plane_b();
      group.data.arrays['arcAngle'] = collection.arc_angle();
      group.data.arrays['capNormalA'] = collection.cap_normal_a();
      group.data.arrays['capNormalB'] = collection.cap_normal_b();
      group.data.arrays['localXAxis'] = collection.local_x_axis();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new GeneralRingGroup(0);
      const collection = fileSector.general_ring_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['center'] = collection.center();
      group.data.arrays['normal'] = collection.normal();
      group.data.arrays['localXAxis'] = collection.local_x_axis();
      group.data.arrays['radiusA'] = collection.radius_x();
      group.data.arrays['radiusB'] = collection.radius_y();
      group.data.arrays['thickness'] = collection.thickness();
      group.data.arrays['angle'] = collection.angle();
      group.data.arrays['arcAngle'] = collection.arc_angle();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new NutGroup(0);
      const collection = fileSector.nut_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['centerA'] = collection.center_a();
      group.data.arrays['centerB'] = collection.center_b();
      group.data.arrays['radiusA'] = collection.radius();
      group.data.arrays['rotationAngle'] = collection.rotation_angle();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new QuadGroup(0);
      const collection = fileSector.quad_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['vertex1'] = collection.vertex_1();
      group.data.arrays['vertex2'] = collection.vertex_2();
      group.data.arrays['vertex3'] = collection.vertex_3();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new SphericalSegmentGroup(0);
      const collection = fileSector.spherical_segment_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['center'] = collection.center();
      group.data.arrays['normal'] = collection.normal();
      group.data.arrays['hRadius'] = collection.radius();
      group.data.arrays['height'] = collection.height();

      // Workaround for the hack in SphericalSegmentGroup's constructor (SphericalSegmentGroup.ts:34)
      for (const attr of group.attributes) {
        if (attr.name != "a_vRadius") {
          continue;
        }
        attr.array = collection.radius();
      }

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new TorusSegmentGroup(0);
      const collection = fileSector.torus_segment_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['center'] = collection.center();
      group.data.arrays['normal'] = collection.normal();
      group.data.arrays['radius'] = collection.radius();
      group.data.arrays['tubeRadius'] = collection.tube_radius();
      group.data.arrays['angle'] = collection.rotation_angle();
      group.data.arrays['arcAngle'] = collection.arc_angle();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    {
      const group = new TrapeziumGroup(0);
      const collection = fileSector.trapezium_collection();
      group.treeIndex = collection.tree_index();
      group.data.count = group.treeIndex.length;
      group.data.arrays['size'] = collection.size();
      group.data.arrays['vertex1'] = collection.vertex_1();
      group.data.arrays['vertex2'] = collection.vertex_2();
      group.data.arrays['vertex3'] = collection.vertex_3();
      group.data.arrays['vertex4'] = collection.vertex_4();

      const nodeIds = collection.node_id();
      const colors = collection.color();
      setupMaps(group, maps, colors, nodeIds, group.treeIndex);

      group.sort();
      sector.primitiveGroups.push(group);
    }
    //console.log("BUILDING merged meshes");
    {
      const group = new MergedMeshGroup();
      const collection = fileSector.triangle_mesh_collection();
      const fileIds = collection.file_id();
      const nodeIds = collection.node_id();
      const treeIndexes = collection.tree_index();
      const colors = collection.color();
      const triangleCounts = collection.triangle_count();
      const sizes = collection.size();

      const meshCounts: { [fileId: string]: number } = {};
      for (const fileId of fileIds) {
        meshCounts[fileId] = meshCounts[fileId] !== undefined ? meshCounts[fileId] + 1 : 1;
      }
      const mergedMeshes: { [fileId: string]: MergedMesh } = {};
      Object.keys(meshCounts).forEach(fileId => {
        if (meshCounts[fileId] == 0) {
          return;
        }
        mergedMeshes[fileId] = new MergedMesh(
          meshCounts[fileId],
          parseInt(fileId, 10),
          false,
          // TODO add back textures
          //data.diffuseTexture,
          //data.specularTexture,
          //data.ambientTexture,
          //data.normalTexture,
          //data.bumpTexture
        );
      });
      // create mappings while calculating running triangle offsets
      const triangleOffsets: { [fileId: string]: number } = {};
      setupMaps(group, maps, colors, nodeIds, treeIndexes);
      for (let i = 0; i < nodeIds.length; i++) {
        triangleOffsets[fileIds[i]] = triangleOffsets[fileIds[i]] ? triangleOffsets[fileIds[i]] : 0;
        mergedMeshes[fileIds[i]].mappings.add(
          triangleOffsets[fileIds[i]],
          triangleCounts[i],
          treeIndexes[i],
          sizes[i],
        );
        triangleOffsets[fileIds[i]] += triangleCounts[i];
      }

      // add meshes to groups
      Object.keys(mergedMeshes).forEach(fileId => {
        sector.mergedMeshGroup.addMesh(mergedMeshes[fileId]);
      });
    }

    //console.log("BUILDING instanced meshes");
    {
      const group = new InstancedMeshGroup();
      const collection = fileSector.instanced_mesh_collection();
      const fileIds = collection.file_id();
      const nodeIds = collection.node_id();
      const treeIndexes = collection.tree_index();
      const colors = collection.color();
      const triangleCounts = collection.triangle_count();
      const triangleOffsets = collection.triangle_offset();
      const sizes = collection.size();
      const translations = collection.translation();
      const rotations = collection.rotation();
      const scales = collection.scale();
      // NOTE this almost duplicate of the same code for merged meshes
      const meshCounts: { [fileId: string]: { [triangleOffset: string]: { count: number; triangleCount: number } } } = {};
      for (let i = 0; i < fileIds.length; i++) {
        const fileId = fileIds[i];
        const triangleOffset = triangleOffsets[i];
        const triangleCount = triangleCounts[i];

        meshCounts[fileId] = meshCounts[fileId] ? meshCounts[fileId] : {};
        meshCounts[fileId][triangleOffset] = meshCounts[fileId][triangleOffset]
          ? meshCounts[fileId][triangleOffset]
          : { count: 0, triangleCount: triangleCount };
        meshCounts[fileId][triangleOffset].count++;
      }

      // Create mesh collections for each file Id and triangle offset
      const collections: { [fileId: string]: { [triangleOffset: string]: InstancedMeshCollection } } = {};
      Object.keys(meshCounts).forEach(fileId => {
        collections[fileId] = collections[fileId] !== undefined ? collections[fileId] : {};
        Object.keys(meshCounts[fileId]).forEach(triangleOffset => {
          const { count, triangleCount } = meshCounts[fileId][triangleOffset];
          collections[fileId][triangleOffset] = new InstancedMeshCollection(
            parseInt(triangleOffset, 10),
            triangleCount,
            count
          );
        });
      });

      setupMaps(group, maps, colors, nodeIds, treeIndexes);


      // TODO move this logic to Rust for improved speed
      // Fill mesh collections with matrix data
      for (let i = 0; i < fileIds.length; i++) {
        const fileId = fileIds[i];
        const treeIndex = treeIndexes[i];
        const nodeId = nodeIds[i];
        const triangleOffset = triangleOffsets[i];
        const triangleCount = triangleCounts[i];
        const color = colors[i];
        const size = sizes[i];

        translation3.set(translations[i * 3 + 0],translations[i * 3 + 1], translations[i * 3 + 2]);
        rotation3.set(rotations[i * 3 + 0], rotations[i * 3 + 1], rotations[i * 3 + 2]);
        scale3.set(scales[i * 3 + 0], scales[i * 3 + 1], scales[i * 3 + 2]);

        maps.treeIndexNodeIdMap[treeIndex] = nodeId;
        matrix.identity().setPosition(translation3);
        matrix.multiply(rotation.makeRotationAxis(zAxis, rotation3.z));
        matrix.multiply(rotation.makeRotationAxis(yAxis, rotation3.y));
        matrix.multiply(rotation.makeRotationAxis(xAxis, rotation3.x));
        matrix.scale(scale3);
        collections[fileId][triangleOffset].addMapping(nodeId, treeIndex, size, matrix);
      }

      // Add collections to sector group
      Object.keys(collections).forEach(fileId => {
        const instancedMesh = new InstancedMesh(parseInt(fileId, 10));
        Object.keys(collections[fileId]).forEach(triangleOffset => {
          instancedMesh.addCollection(collections[fileId][triangleOffset]);
        });
        sector.instancedMeshGroup.addMesh(instancedMesh);
      });
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
  console.log("DONE COPYING DATA");

  const rootSector = maps.sectors[scene.root_sector_id];
  const sceneStats = createSceneStats();
  console.log("MERGE MESHES");
  mergeInstancedMeshes(rootSector, sceneStats);
  console.log("DONE MERGE MESHES");


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

  console.log("SCENE COMPLETE");

  return {
    rootSector,
    sceneStats,
    maps,
  };
}

export function parseFullCustomFile(
  fileBuffer: ArrayBuffer,
  meshLoader: any,
  filterOptions?: FilterOptions
): ParseReturn {
  console.log("PARSE FULL CUSTOM");

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
