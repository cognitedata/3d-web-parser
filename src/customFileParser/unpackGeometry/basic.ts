import { SectorInformation, GeometryGroups } from './../sharedFileParserTypes';
import DataLoader from './../DataLoader';
import { zAxis } from './../../constants';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addBox(groups: GeometryGroups, data: DataLoader) {
  groups.box.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    data.rotationAngle, data.delta);
}

function addCircle(groups: GeometryGroups, data: DataLoader) {
  groups.circle.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    data.radiusA);
}

function addNut(groups: GeometryGroups, data: DataLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.nut.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
    data.radiusA, data.rotationAngle);
}

function addRing(groups: GeometryGroups, data: DataLoader) {
  groups.generalRing.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    new THREE.Vector3(1, 0, 0), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
    data.rotationAngle, data.arcAngle);
}

function addSphere(groups: GeometryGroups, data: DataLoader) {
  groups.sphericalSegment.add(data.nodeId, data.treeIndex, data.color, data.center, zAxis,
  data.radiusA, 2 * data.radiusA);
}

export { addBox, addCircle, addNut, addRing, addSphere };
