import { unpackFilePrimitive, unpackInstancedMesh, unpackTriangleMesh } from './unpackGeometry/main';
import Sector from './../Sector';
import { CompressedGeometryData, UncompressedValues }
  from './sharedFileParserTypes';
import CustomFileReader from './CustomFileReader';
import { renderedPrimitives, renderedPrimitiveToGroup } from './parserParameters';
import SceneStats from './../SceneStats';
import { MergedMeshGroup } from '../geometry/MergedMeshGroup';
import { InstancedMeshGroup } from '../geometry/InstancedMeshGroup';

function unpackData(
  sector: Sector,
  uncompressedValues: UncompressedValues,
  compressedGeometryData: {[name: string]: CompressedGeometryData[]},
  sceneStats: SceneStats): Sector {

  // Unpack primitives
  compressedGeometryData.primitives.forEach(primitiveCompressedData => {
    unpackFilePrimitive(sector, primitiveCompressedData, uncompressedValues);
  });

  sector.mergedMeshGroup = new MergedMeshGroup();
  sector.instancedMeshGroup = new InstancedMeshGroup();
  // Unpack meshes
  compressedGeometryData.meshes.forEach(meshCompressedData => {
    if (meshCompressedData.type === 'InstancedMesh') {
      unpackInstancedMesh(sector.instancedMeshGroup, meshCompressedData, uncompressedValues, sceneStats);
    } else if (meshCompressedData.type === 'TriangleMesh') {
      unpackTriangleMesh(sector.mergedMeshGroup, meshCompressedData, uncompressedValues, sceneStats);
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

  let rootSector = undefined;
  let uncompressedValues = undefined;
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
    unpackData(sector, uncompressedValues, compressedGeometryData, sceneStats);
  }

  const sectors = idToSectorMap;

  return { rootSector, sectors, sceneStats };
}
