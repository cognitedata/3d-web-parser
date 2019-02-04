import loadSectorOutline from './loadSectorOutline';
import unpackGeometry from './unpackGeometry/main';
import Sector from './../Sector';
import * as THREE from 'three';

import countGeometries from './countGeometries';

import { GeometryGroups } from './sharedFileParserTypes';
import BufferReader from './BufferReader';

function parseRootSector(incomingFile: ArrayBuffer, start: number, length: number) {
  const sectorOutline = loadSectorOutline(incomingFile, start, length, true);

  return { metadata: sectorOutline.metadata, trueValueArrays: sectorOutline.trueValueArrays };
}

function parseSingleSector(incomingFile: ArrayBuffer, start: number, length: number, trueValueArrays: any) {
  const sectorMetadata = loadSectorOutline(incomingFile, start, length, true).metadata;

  const counts = countGeometries(sectorMetadata);
  const groups = new GeometryGroups(counts);

  // unpackGeometry(groups, sectorMetadata, trueValueArrays, 'Box');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'Circle');
  /* unpackGeometry(groups, sectorMetadata, trueValueArrays, 'ClosedCone');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'ClosedCylinder');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'ClosedEccentricCone');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'ClosedEllipsoidSegment');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'ClosedExtrudedRingSegment');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'ClosedGeneralCylinder');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'ClosedSphericalSegment');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'ClosedTorusSegment');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'Ellipsoid');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'ExtrudedRing');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'Nut');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'OpenCone');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'OpenCylinder');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'OpenEccentricCone');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'OpenEllipsoidSegment');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'OpenExtrudedRingSegment');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'OpenGeneralCylinder');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'OpenSphericalSegment');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'OpenTorusSegment');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'Ring');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'Sphere');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'Torus');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'TriangleMesh');
  unpackGeometry(groups, sectorMetadata, trueValueArrays, 'InstancedMesh');
  */

  const sector = new Sector(sectorMetadata.sectorBBoxMin, sectorMetadata.sectorBBoxMax);

  const keys = Object.keys(groups);
  for (let i = 0; i < keys.length; i++) {
    sector.primitiveGroups.push(groups[keys[i]]);
  }

  return { sector: sector, metadata: sectorMetadata };
}

function parseManySectors(incomingFile: ArrayBuffer) {
  const file = new BufferReader(incomingFile, 0, incomingFile.byteLength, true);

  const sectors: {[name: string]: any} = {};

  let length = file.readUint32();

  const rootSectorInfo = parseRootSector(incomingFile, file.location, length);
  file.skip(length);
  const rootSector = new Sector(rootSectorInfo.metadata.sectorBBoxMin, rootSectorInfo.metadata.sectorBBoxMax);
  const trueValueArrays = rootSectorInfo.trueValueArrays;
  sectors[rootSectorInfo.metadata.sectorId] = rootSector;
  console.log(rootSector);
  console.log(rootSectorInfo.metadata);
  console.log(rootSectorInfo.trueValueArrays);

  while (file.location !== incomingFile.byteLength) {
    length = file.readUint32();
    // @ts-ignore
    const newSectorInfo = parseSingleSector(incomingFile, file.location, trueValuesArrays, length);
    file.skip(length);
    const parentSector = sectors[newSectorInfo.metadata.parentSectorId];
    if (parentSector !== undefined) {
      console.log(newSectorInfo.sector);
      console.log(newSectorInfo.metadata);
      parentSector.addChild(newSectorInfo.sector);
      parentSector.object3d.add(newSectorInfo.sector.object3d);
      sectors[newSectorInfo.metadata.sectorId] = newSectorInfo.sector;
    } else { throw Error('parent sector not found'); }
  }

  return rootSector;
}

export { parseSingleSector, parseManySectors };
