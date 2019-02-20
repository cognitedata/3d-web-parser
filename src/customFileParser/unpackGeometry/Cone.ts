import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addOpenCone(groups: {[name: string]: any}, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, centerA, centerB,
  data.radiusA, data.radiusB, data.rotationAngle);
}

function addOpenEccentricCone(groups: {[name: string]: any}, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.EccentricCone.add(data.nodeId, data.treeIndex, centerA, centerB,
    data.radiusA, data.radiusB, data.normal);
}

function addClosedCone(groups: {[name: string]: any}, data: PropertyLoader) {
  addOpenCone(groups, data);
  groups.Circle.add(data.nodeId, data.treeIndex, centerA, data.normal, data.radiusA);
  groups.Circle.add(data.nodeId, data.treeIndex, centerB, data.normal, data.radiusB);
}

function addClosedEccentricCone(groups: {[name: string]: any}, data: PropertyLoader) {
  addOpenEccentricCone(groups, data);
  groups.Circle.add(data.nodeId, data.treeIndex, centerA, data.normal, data.radiusA);
  groups.Circle.add(data.nodeId, data.treeIndex, centerB, data.normal, data.radiusB);
}

export { addClosedCone, addClosedEccentricCone, addOpenCone, addOpenEccentricCone };
