import { RenderedGeometryGroups } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { xAxis, zAxis } from './../../constants';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

const localXAxis = new THREE.Vector3();
const rotation = new THREE.Quaternion();

function addClosedCylinder(groups: RenderedGeometryGroups, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
    data.radiusA, data.radiusA, data.rotationAngle);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusA);
}

function addGeneralCylinder(groups: RenderedGeometryGroups, data: PropertyLoader) {
  // TODO
}

function addOpenCylinder(groups: RenderedGeometryGroups, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
  data.radiusA, data.radiusA, data.rotationAngle);
}

export { addClosedCylinder, addOpenCylinder, addGeneralCylinder };
