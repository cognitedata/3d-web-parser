import { RenderedGeometryGroups } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
import { zAxis } from '../../constants';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addBox(groups: RenderedGeometryGroups, data: PropertyLoader) {
  groups.Box.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    data.rotationAngle, data.delta);
}

function addCircle(groups: RenderedGeometryGroups, data: PropertyLoader) {
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    data.radiusA);
}

function addNut(groups: RenderedGeometryGroups, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Nut.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
    data.radiusA, data.rotationAngle);
}

function addRing(groups: RenderedGeometryGroups, data: PropertyLoader) {
  groups.GeneralRing.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    new THREE.Vector3(1, 0, 0), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
    data.rotationAngle, data.arcAngle);
}

function addSphere(groups: RenderedGeometryGroups, data: PropertyLoader) {
  groups.SphericalSegment.add(data.nodeId, data.treeIndex, data.color, data.center, zAxis,
  data.radiusA, 2 * data.radiusA);
}

export { addBox, addCircle, addNut, addRing, addSphere };
