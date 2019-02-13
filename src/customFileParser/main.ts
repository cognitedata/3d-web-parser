import { unpackPrimitive, unpackInstancedMesh, unpackTriangleMesh } from './unpackGeometry/main';
import Sector from './../Sector';
import countRenderedPrimitives from './countRenderedPrimitives';
import { SectorMetadata, GeometryIndexHandler, UncompressedValues, RenderedPrimitiveGroups }
  from './sharedFileParserTypes';
import CustomFileReader from './CustomFileReader';
import { renderedPrimitives, renderedPrimitiveToGroup } from './parserParameters';
import SceneStats from './../SceneStats';

function createSector(
  sectorMetadata: SectorMetadata,
  uncompressedValues: UncompressedValues,
  primitiveIndexHandlers: GeometryIndexHandler[],
  meshIndexHandlers: GeometryIndexHandler[]): Sector {

  const sector = new Sector(sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);

  // Unpack primitives
  const counts = countRenderedPrimitives(primitiveIndexHandlers);
  const renderedPrimitiveGroups: RenderedPrimitiveGroups = {};
  renderedPrimitives.forEach(renderedPrimitive => {
    const count = counts[renderedPrimitive];
    renderedPrimitiveGroups[renderedPrimitive] = new renderedPrimitiveToGroup[renderedPrimitive](count);
  });
  primitiveIndexHandlers.forEach(primitiveIndexHandler => {
    unpackPrimitive(renderedPrimitiveGroups, primitiveIndexHandler, uncompressedValues);
  });
  Object.keys(renderedPrimitiveGroups).forEach(renderedPrimitiveName => {
    sector.primitiveGroups.push(renderedPrimitiveGroups[renderedPrimitiveName]);
  });

  // Unpack meshes
  meshIndexHandlers.forEach(meshIndexHandler => {
    if (meshIndexHandler.name === 'InstancedMesh') {
      sector.instancedMeshGroup = unpackInstancedMesh(meshIndexHandler, uncompressedValues);
    } else if (meshIndexHandler.name === 'TriangleMesh') {
      sector.mergedMeshGroup = unpackTriangleMesh(meshIndexHandler, uncompressedValues);
    }
  });

  return sector;
}

function parseManySectors(fileBuffer: ArrayBuffer) {
  const fileReader = new CustomFileReader(fileBuffer);
  const sectors: {[name: string]: any} = {};

  let sectorStartLocation = 0;
  let sectorByteLength = fileReader.readUint32();
  let sectorMetadata = fileReader.readSectorMetadata(sectorByteLength);
  const uncompressedValues = fileReader.readUncompressedValues();
  let geometries = fileReader.readSectorGeometryIndexHandlers(sectorStartLocation + sectorByteLength);
  let primitiveIndexHandlers = geometries.primitives;
  let meshIndexHandlers = geometries.meshes;
  const rootSector = createSector(sectorMetadata, uncompressedValues, primitiveIndexHandlers, meshIndexHandlers);
  sectors[sectorMetadata.sectorId] = rootSector;

  while (fileReader.location < fileBuffer.byteLength) {
    sectorStartLocation = fileReader.location;
    sectorByteLength = fileReader.readUint32();
    sectorMetadata = fileReader.readSectorMetadata(sectorByteLength);
    geometries = fileReader.readSectorGeometryIndexHandlers(sectorStartLocation + sectorByteLength);
    primitiveIndexHandlers = geometries.primitives;
    meshIndexHandlers = geometries.meshes;
    const newSectorObject = createSector(sectorMetadata, uncompressedValues, primitiveIndexHandlers, meshIndexHandlers);
    const parentSector = sectors[sectorMetadata.parentSectorId];
    if (parentSector !== undefined) {
      parentSector.addChild(newSectorObject);
      parentSector.object3d.add(newSectorObject.object3d);
      sectors[sectorMetadata.sectorId] = newSectorObject;
    } else { throw Error('Parent sector not found'); }
  }
  const sceneStats: SceneStats = {
    numInstancedMeshes: 0,
    numMergedMeshes: 0,
  };

  return { rootSector, sectors, sceneStats };
}

function parseSingleSector(fileBuffer: ArrayBuffer): Sector {
  const fileReader = new CustomFileReader(fileBuffer);
  const sectorMetadata = fileReader.readSectorMetadata(fileBuffer.byteLength);
  const uncompressedValues = fileReader.readUncompressedValues();
  const geometries = fileReader.readSectorGeometryIndexHandlers(fileBuffer.byteLength);
  const primitiveIndexHandlers = geometries.primitives;
  const meshIndexHandlers = geometries.meshes;
  return createSector(sectorMetadata, uncompressedValues, primitiveIndexHandlers, meshIndexHandlers);
}

export { parseManySectors, parseSingleSector };
