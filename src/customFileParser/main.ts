import unpackGeometry from './unpackGeometry/main';
import Sector from './../Sector';
import countRenderedGeometries from './countRenderedGeometries';
import { SectorMetadata, GeometryIndexHandler, UncompressedValues, RenderedGeometryGroups }
  from './sharedFileParserTypes';
import CustomFileReader from './CustomFileReader';
import { renderedGeometries, renderedGeometryToGroup } from './parserParameters';

function createSector(
  sectorMetadata: SectorMetadata,
  uncompressedValues: UncompressedValues,
  geometryIndexHandlers: GeometryIndexHandler[]): Sector {

  const counts = countRenderedGeometries(geometryIndexHandlers);
  const renderedGeometryGroups: RenderedGeometryGroups = {};
  renderedGeometries.forEach(renderedGeometry => {
    const count = counts[renderedGeometry];
    renderedGeometryGroups[renderedGeometry] = new renderedGeometryToGroup[renderedGeometry](count);
  });

  const groupNames = ['Box', 'Circle', 'ClosedCone', 'ClosedCylinder', 'ClosedEccentricCone', 'ClosedEllipsoidSegment',
    'ClosedExtrudedRingSegment', 'ClosedGeneralCylinder', 'ClosedSphericalSegment', 'ClosedTorusSegment', 'Ellipsoid',
    'ExtrudedRing', 'Nut', 'OpenCone', 'OpenCylinder', 'OpenEccentricCone', 'OpenEllipsoidSegment',
    'OpenExtrudedRingSegment', 'OpenGeneralCylinder', 'OpenSphericalSegment', 'OpenTorusSegment', 'Ring', 'Sphere',
    'Torus', 'TriangleMesh', 'InstancedMesh'];
  groupNames.forEach(name => {
    unpackGeometry(renderedGeometryGroups, geometryIndexHandlers, uncompressedValues, name);
  });

  const sectorObject = new Sector(sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);
  Object.keys(renderedGeometryGroups).forEach(renderedGeometryName => {
    if (renderedGeometryName === 'TriangleMesh') {

    } else if (renderedGeometryName === 'InstancedMesh') {

    } else {
      sectorObject.primitiveGroups.push(renderedGeometryGroups[renderedGeometryName]);
    }
  });

  return sectorObject;
}

function parseManySectors(fileBuffer: ArrayBuffer): Sector {
  const fileReader = new CustomFileReader(fileBuffer);
  const sectors: {[name: string]: any} = {};

  let sectorStartLocation = 0;
  let sectorByteLength = fileReader.readUint32();
  let sectorMetadata = fileReader.readSectorMetadata(sectorByteLength);
  const uncompressedValues = fileReader.readUncompressedValues();
  let geometryIndexHandlers = fileReader.readSectorGeometryIndexHandlers(sectorStartLocation + sectorByteLength);
  const rootSector = createSector(sectorMetadata, uncompressedValues, geometryIndexHandlers);
  sectors[sectorMetadata.sectorId] = rootSector;

  while (fileReader.location < fileBuffer.byteLength) {
    sectorStartLocation = fileReader.location;
    sectorByteLength = fileReader.readUint32();
    sectorMetadata = fileReader.readSectorMetadata(sectorByteLength);
    geometryIndexHandlers = fileReader.readSectorGeometryIndexHandlers(sectorStartLocation + sectorByteLength);
    const newSectorObject = createSector(sectorMetadata, uncompressedValues, geometryIndexHandlers);
    const parentSector = sectors[sectorMetadata.parentSectorId];
    if (parentSector !== undefined) {
      parentSector.addChild(newSectorObject);
      parentSector.object3d.add(newSectorObject.object3d);
      sectors[sectorMetadata.sectorId] = newSectorObject;
    } else { throw Error('Parent sector not found'); }
  }

  return rootSector;
}

function parseSingleSector(fileBuffer: ArrayBuffer): Sector {
  const fileReader = new CustomFileReader(fileBuffer);
  const sectorMetadata = fileReader.readSectorMetadata(fileBuffer.byteLength);
  const uncompressedValues = fileReader.readUncompressedValues();
  const geometryIndexHandlers = fileReader.readSectorGeometryIndexHandlers(fileBuffer.byteLength);
  return createSector(sectorMetadata, uncompressedValues, geometryIndexHandlers);
}

export { parseManySectors, parseSingleSector };
