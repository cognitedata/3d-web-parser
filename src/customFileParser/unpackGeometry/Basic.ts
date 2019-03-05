import PropertyLoader from '../PropertyLoader';
import { xAxis, zAxis } from '../../constants';
import * as THREE from 'three';

import { PrimitiveGroup, BoxGroup, NutGroup, CircleGroup, GeneralRingGroup, SphericalSegmentGroup }
  from '../../geometry/GeometryGroups';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const localXAxis = new THREE.Vector3();
const axisRotation = new THREE.Quaternion();

function addBox(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  (groups.Box as BoxGroup).add(data.nodeId, data.treeIndex, data.center, data.normal,
    data.rotationAngle, data.delta);
}

function addCircle(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, data.center, data.normal,
    data.radiusA);
}

function addNut(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.Nut as NutGroup).add(data.nodeId, data.treeIndex, centerA, centerB,
    data.radiusA, data.rotationAngle);
}

function addRing(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  localXAxis.copy(xAxis).applyQuaternion(axisRotation.setFromUnitVectors(zAxis, data.normal));
  (groups.GeneralRing as GeneralRingGroup).add(data.nodeId, data.treeIndex, data.center, data.normal,
    localXAxis, data.radiusB, data.radiusB, data.radiusB - data.radiusA, 0, 2 * Math.PI);
}

function addSphere(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  (groups.SphericalSegment as SphericalSegmentGroup).add(data.nodeId, data.treeIndex, data.center, zAxis,
  data.radiusA, 2 * data.radiusA);
}

export { addBox, addCircle, addNut, addRing, addSphere };
