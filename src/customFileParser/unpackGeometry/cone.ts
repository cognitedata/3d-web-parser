import { GeometryGroups } from './../sharedFileParserTypes';
import DataLoader from './../DataLoader';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addOpenCone(groups: GeometryGroups, data: DataLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
  data.radiusA, data.radiusB, data.rotationAngle);
}

function addOpenEccentricCone(groups: GeometryGroups, data: DataLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.eccentricCone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
    data.radiusA, data.radiusA, data.normal);
}

function addClosedCone(groups: GeometryGroups, data: DataLoader) {
  addOpenCone(groups, data);
  groups.circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
  groups.circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusB);
}

function addClosedEccentricCone(groups: GeometryGroups, data: DataLoader) {
  addOpenEccentricCone(groups, data);
  groups.circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
  groups.circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusA);
}

export { addClosedCone, addClosedEccentricCone, addOpenCone, addOpenEccentricCone };
