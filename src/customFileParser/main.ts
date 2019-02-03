import readSegmentFile from './readSegmentFile';
import loadGeometryGroup from './generateGeometryGroups';
import Sector from './../Sector';
import * as THREE from 'three';

import countGeometries from './countGeometries';

import { GeometryGroups } from './sharedFileParserTypes';

export default function parseCustomFile(incomingFile: ArrayBuffer) {
  const parsedFile = readSegmentFile(incomingFile, true);
  const counts = countGeometries(parsedFile);

  const groups = new GeometryGroups(counts);

  loadGeometryGroup(groups, parsedFile, 'Box');
  loadGeometryGroup(groups, parsedFile, 'Circle');
  loadGeometryGroup(groups, parsedFile, 'ClosedCone');
  loadGeometryGroup(groups, parsedFile, 'ClosedCylinder');
  loadGeometryGroup(groups, parsedFile, 'ClosedEccentricCone');
  loadGeometryGroup(groups, parsedFile, 'ClosedEllipsoidSegment');
  loadGeometryGroup(groups, parsedFile, 'ClosedExtrudedRingSegment');
  loadGeometryGroup(groups, parsedFile, 'ClosedGeneralCylinder');
  loadGeometryGroup(groups, parsedFile, 'ClosedSphericalSegment');
  loadGeometryGroup(groups, parsedFile, 'ClosedTorusSegment');
  loadGeometryGroup(groups, parsedFile, 'Ellipsoid');
  loadGeometryGroup(groups, parsedFile, 'ExtrudedRing');
  loadGeometryGroup(groups, parsedFile, 'Nut');
  loadGeometryGroup(groups, parsedFile, 'OpenCone');
  loadGeometryGroup(groups, parsedFile, 'OpenCylinder');
  loadGeometryGroup(groups, parsedFile, 'OpenEccentricCone');
  loadGeometryGroup(groups, parsedFile, 'OpenEllipsoidSegment');
  loadGeometryGroup(groups, parsedFile, 'OpenExtrudedRingSegment');
  loadGeometryGroup(groups, parsedFile, 'OpenGeneralCylinder');
  loadGeometryGroup(groups, parsedFile, 'OpenSphericalSegment');
  loadGeometryGroup(groups, parsedFile, 'OpenTorusSegment');
  loadGeometryGroup(groups, parsedFile, 'Ring');
  loadGeometryGroup(groups, parsedFile, 'Sphere');
  loadGeometryGroup(groups, parsedFile, 'Torus');
  loadGeometryGroup(groups, parsedFile, 'TriangleMesh');
  loadGeometryGroup(groups, parsedFile, 'InstancedMesh');

  const sector = new Sector(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1000, 1000, 1000));

  const keys = Object.keys(groups);
  for (let i = 0; i < keys.length; i++) {
    sector.primitiveGroups.push(groups[keys[i]]);
  }

  return sector;
}
