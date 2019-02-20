import PropertyLoader from '../PropertyLoader';
import { xAxis, zAxis } from '../../constants';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const localXAxis = new THREE.Vector3();
const axisRotation = new THREE.Quaternion();

function addBox(groups: {[name: string]: any}, data: PropertyLoader) {
  groups.Box.add(data.nodeId, data.treeIndex, data.center, data.normal,
    data.rotationAngle, data.delta);
}

function addCircle(groups: {[name: string]: any}, data: PropertyLoader) {
  groups.Circle.add(data.nodeId, data.treeIndex, data.center, data.normal,
    data.radiusA);
}

function addNut(groups: {[name: string]: any}, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Nut.add(data.nodeId, data.treeIndex, centerA, centerB,
    data.radiusA, data.rotationAngle);
}

function addRing(groups: {[name: string]: any}, data: PropertyLoader) {
  localXAxis.copy(xAxis).applyQuaternion(axisRotation.setFromUnitVectors(zAxis, data.normal));
  groups.GeneralRing.add(data.nodeId, data.treeIndex, data.center, data.normal,
    localXAxis, data.radiusB, data.radiusB, data.radiusB - data.radiusA, 0, 2 * Math.PI);
}

function addSphere(groups: {[name: string]: any}, data: PropertyLoader) {
  groups.SphericalSegment.add(data.nodeId, data.treeIndex, data.center, zAxis,
  data.radiusA, 2 * data.radiusA);
}

export { addBox, addCircle, addNut, addRing, addSphere };
