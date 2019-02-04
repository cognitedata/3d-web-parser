import { GeometryGroups } from './../sharedFileParserTypes';
import DataLoader from './../DataLoader';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addClosedCylinder(groups: GeometryGroups, data: DataLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
    data.radiusA, data.radiusA, data.rotationAngle);
  groups.circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
  groups.circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusA);
}

function addClosedGeneralCylinder(groups: GeometryGroups, data: DataLoader) {
  groups.generalCylinder.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
    data.height / 2, data.height / 2, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB,
    data.rotationAngle, data.arcAngle);
  // groups.generalRing.add
  // groups.generalRing.add
}

function addOpenCylinder(groups: GeometryGroups, data: DataLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
  data.radiusA, data.radiusA, data.rotationAngle);
}

function addOpenGeneralCylinder(groups: GeometryGroups, data: DataLoader) {
  groups.generalCylinder.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
    data.height / 2, data.height / 2, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB, data.rotationAngle,
    data.arcAngle);
}

export { addClosedCylinder, addClosedGeneralCylinder, addOpenCylinder, addOpenGeneralCylinder };
