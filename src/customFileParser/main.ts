import readSegmentFile from './readSegmentFile';
import loadGeometryGroup from './generateGeometryGroups';
import Sector from './../Sector';
import * as THREE from 'three';

import countGeometries from './countGeometries';

import BoxGroup from '../geometry/BoxGroup';
import CircleGroup from '../geometry/CircleGroup';
import ConeGroup from '../geometry/ConeGroup';
import EccentricConeGroup from '../geometry/EccentricConeGroup';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';
import GeneralCylinderGroup from '../geometry/GeneralCylinderGroup';
import GeneralRingGroup from '../geometry/GeneralRingGroup';
import NutGroup from '../geometry/NutGroup';
import QuadGroup from '../geometry/QuadGroup';
import SphericalSegmentGroup from '../geometry/SphericalSegmentGroup';
import TorusSegmentGroup from '../geometry/TorusSegmentGroup';
import TrapeziumGroup from '../geometry/TrapeziumGroup';
import { MergedMeshMappings } from '../geometry/MergedMeshGroup';
import { InstancedMeshMappings } from '../geometry/InstancedMeshGroup';

import { GeometryGroups } from './sharedFileParserTypes';

export default function parseCustomFile(incomingFile: Uint8Array) {
  const parsedFile = readSegmentFile(incomingFile, true);
  const counts = countGeometries(parsedFile);

  const groups: GeometryGroups = {
    box: new BoxGroup(counts.box),
    circle: new CircleGroup(counts.circle),
    cone: new ConeGroup(counts.cone),
    eccentricCone: new EccentricConeGroup(counts.eccentricCone),
    ellipsoidSegment: new EllipsoidSegmentGroup(counts.ellipsoidSegment),
    generalCylinder: new GeneralCylinderGroup(counts.generalCylinder),
    generalRing: new GeneralRingGroup(counts.generalRing),
    nut: new NutGroup(counts.nut),
    quad: new QuadGroup(counts.quad),
    sphericalSegment: new SphericalSegmentGroup(counts.generalCylinder),
    torusSegment: new TorusSegmentGroup(counts.torusSegment),
    trapezium: new TrapeziumGroup(counts.trapezium),
    triangleMesh: new MergedMeshMappings(counts.triangleMesh),
    instancedMesh: new InstancedMeshMappings(counts.instancedMesh),
  };

  loadGeometryGroup(groups, parsedFile, 'Box');

  const sector = new Sector(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1000, 1000, 1000));

  const keys = Object.keys(groups);
  for (let i = 0; i < keys.length; i++) {
    sector.primitiveGroups.push(groups[keys[i]]);
  }

  return sector;
}
