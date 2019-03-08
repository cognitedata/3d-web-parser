import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { PrimitiveGroup, ConeGroup, EccentricConeGroup, CircleGroup } from '../../geometry/GeometryGroups';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addOpenCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.Cone as ConeGroup).add(data.nodeId, data.treeIndex, centerA, centerB,
  data.radiusA, data.radiusB, 0, Math.PI * 2);
}

function addOpenEccentricCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.EccentricCone as EccentricConeGroup).add(data.nodeId, data.treeIndex, centerA, centerB,
    data.radiusA, data.radiusB, data.normal);
}

function addClosedCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  addOpenCone(groups, data);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerA, data.normal, data.radiusA);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerB, data.normal, data.radiusB);
}

function addClosedEccentricCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  addOpenEccentricCone(groups, data);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerA, data.normal, data.radiusA);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerB, data.normal, data.radiusB);
}

export { addClosedCone, addClosedEccentricCone, addOpenCone, addOpenEccentricCone };
