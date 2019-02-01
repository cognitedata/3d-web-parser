import readSegmentFile from './readSegmentFile';
import generateGeometryGroups from './generateGeometryGroups';
import Sector from './../Sector';
import * as THREE from 'three';

function parseCustomFile(incomingFile: Uint8Array) {
  const parsedFile = readSegmentFile(incomingFile, true);
  const geometryGroups = generateGeometryGroups(parsedFile);
  const sector = new Sector(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1000, 1000, 1000));

  const keys = Object.keys(geometryGroups);
  for (let i = 0; i < keys.length; i++) {
    sector.geometries.push(geometryGroups[keys[i]]);
  }

  return sector;
}
