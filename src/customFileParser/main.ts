import unpackGeometry from './unpackGeometry/main';
import Sector from './../Sector';
import countRenderedGeometries from './countRenderedGeometries';
import { SectorMetadata, GeometryIndexHandler, TrueValueArrays, RenderedGeometryGroups }
  from './sharedFileParserTypes';
import CustomFileReader from './CustomFileReader';
import { renderedGeometries, renderedGeometryToGroup } from './parserParameters';

function fillSector(
  geometryIndexHandlers: GeometryIndexHandler[],
  sectorMetadata: SectorMetadata,
  trueValueArrays: TrueValueArrays): Sector {

  const counts = countRenderedGeometries(geometryIndexHandlers);
  const renderedGeometryGroups: RenderedGeometryGroups = {};
  renderedGeometries.forEach(renderedGeometry => {
    const count = counts[renderedGeometry];
    renderedGeometryGroups[renderedGeometry] = new renderedGeometryToGroup[renderedGeometry](count);
  });

  const groupNames = ['Box', 'Circle', 'ClosedCone', 'ClosedCylinder', 'ClosedEccentricCone', 'ClosedEllipsoidSegment',
    'ClosedExtrudedRingSegment', 'ClosedGeneralCylinder', 'ClosedSphericalSegment', 'ClosedTorusSegment', 'Ellipsoid',
    /*'ExtrudedRing', */'Nut', 'OpenCone', 'OpenCylinder', /*'OpenEccentricCone', 'OpenEllipsoidSegment',
    'OpenExtrudedRingSegment', 'OpenGeneralCylinder', 'OpenSphericalSegment', 'OpenTorusSegment', 'Ring', 'Sphere',
    'Torus', 'TriangleMesh', 'InstancedMesh'*/];
  groupNames.forEach(name => {
    unpackGeometry(renderedGeometryGroups, geometryIndexHandlers, trueValueArrays, name);
  });

  const sectorObject = new Sector(sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);
  const keys = Object.keys(renderedGeometryGroups);
  for (let i = 0; i < keys.length; i++) {
    sectorObject.primitiveGroups.push(renderedGeometryGroups[keys[i]]);
  }
  return sectorObject;
}

function parseManySectors(incomingFile: ArrayBuffer): Sector {
  const file = new CustomFileReader(incomingFile);
  const sectors: {[name: string]: any} = {};

  let sectorStartLocation = file.location;
  let sectorByteLength = file.readUint32();
  let sectorMetadata = file.readSectorMetadata(sectorByteLength);
  const trueValueArrays = file.readTrueValueArrays();
  let geometryIndexHandlers = file.readSectorGeometryIndexHandlers(sectorStartLocation + sectorByteLength);
  const rootSector = fillSector(geometryIndexHandlers, sectorMetadata, trueValueArrays);
  sectors[sectorMetadata.sectorId] = rootSector;

  while (file.location !== incomingFile.byteLength) {
    sectorStartLocation = file.location;
    sectorByteLength = file.readUint32();
    sectorMetadata = file.readSectorMetadata(sectorByteLength);
    geometryIndexHandlers = file.readSectorGeometryIndexHandlers(sectorStartLocation + sectorByteLength);
    const newSectorObject = fillSector(geometryIndexHandlers, sectorMetadata, trueValueArrays);
    console.log(newSectorObject);
    const parentSector = sectors[sectorMetadata.parentSectorId];
    if (parentSector !== undefined) {
      parentSector.addChild(newSectorObject);
      parentSector.object3d.add(newSectorObject.object3d);
      sectors[sectorMetadata.sectorId] = newSectorObject;
    } else { throw Error('Parent sector not found'); }
  }

  return rootSector;
}

export { parseManySectors };
