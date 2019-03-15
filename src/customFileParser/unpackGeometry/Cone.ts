import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { PrimitiveGroup, ConeGroup, EccentricConeGroup, CircleGroup } from '../../geometry/GeometryGroups';
import { FilterOptions } from '../../parsers/parseUtils';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addOpenCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.Cone as ConeGroup).add(data.nodeId, data.treeIndex, centerA, centerB,
  data.radiusA, data.radiusB, 0, Math.PI * 2, filterOptions);
}

function addOpenEccentricCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                              filterOptions?: FilterOptions) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.EccentricCone as EccentricConeGroup).add(data.nodeId, data.treeIndex, centerA, centerB,
    data.radiusA, data.radiusB, data.normal, filterOptions);
}

function addClosedCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  addOpenCone(groups, data);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerA, data.normal, data.radiusA, filterOptions);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerB, data.normal, data.radiusB, filterOptions);
}

function addClosedEccentricCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                filterOptions?: FilterOptions) {
  addOpenEccentricCone(groups, data);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerA, data.normal, data.radiusA, filterOptions);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerB, data.normal, data.radiusB, filterOptions);
}

export { addClosedCone, addClosedEccentricCone, addOpenCone, addOpenEccentricCone };
