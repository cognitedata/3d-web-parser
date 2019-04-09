import PropertyLoader from '../PropertyLoader';
import { xAxis, zAxis } from '../../constants';
import * as THREE from 'three';

import { PrimitiveGroup, BoxGroup, NutGroup, CircleGroup, GeneralRingGroup, SphericalSegmentGroup }
  from '../../geometry/GeometryGroups';
import { FilterOptions } from '../../parsers/parseUtils';

const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();
const globalXAxis = new THREE.Vector3();
const globalAxisRotation = new THREE.Quaternion();

function addBox(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  (groups.Box as BoxGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, data.center, data.normal,
    data.rotationAngle, data.delta, filterOptions);
}

function addCircle(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, data.center, data.normal,
    data.radiusA, filterOptions);
}

function addNut(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  globalCenterA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  globalCenterB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.Nut as NutGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, globalCenterA, globalCenterB,
    data.radiusA, data.rotationAngle, filterOptions);
}

function addRing(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  globalXAxis.copy(xAxis).applyQuaternion(globalAxisRotation.setFromUnitVectors(zAxis, data.normal));
  (groups.GeneralRing as GeneralRingGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, data.center, data.normal,
    globalXAxis, data.radiusB, data.radiusB, data.radiusB - data.radiusA, 0, 2 * Math.PI, filterOptions);
}

function addSphere(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  (groups.SphericalSegment as SphericalSegmentGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, data.center, zAxis,
  data.radiusA, 2 * data.radiusA, filterOptions);
}

export { addBox, addCircle, addNut, addRing, addSphere };
