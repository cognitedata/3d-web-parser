import { RenderedPrimitiveGroups } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addOpenCone(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
  data.radiusA, data.radiusB, data.rotationAngle);
}

function addOpenEccentricCone(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.EccentricCone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
    data.radiusA, data.radiusA, data.normal);
}

function addClosedCone(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  addOpenCone(groups, data);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusB);
}

function addClosedEccentricCone(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  addOpenEccentricCone(groups, data);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusA);
}

export { addClosedCone, addClosedEccentricCone, addOpenCone, addOpenEccentricCone };
