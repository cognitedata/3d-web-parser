import PropertyLoader from '../PropertyLoader';
import { xAxis, zAxis } from '../../constants';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const localXAxis = new THREE.Vector3();
const axisRotation = new THREE.Quaternion();

function addBox(groups: any, data: PropertyLoader) {
<<<<<<< HEAD
  groups.Box.add(data.nodeId, data.treeIndex, data.center, data.normal,
=======
  groups.Box.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
>>>>>>> e160f545c56e2180472eb73add30f9bdd5f7ad47
    data.rotationAngle, data.delta);
}

function addCircle(groups: any, data: PropertyLoader) {
<<<<<<< HEAD
  groups.Circle.add(data.nodeId, data.treeIndex, data.center, data.normal,
=======
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
>>>>>>> e160f545c56e2180472eb73add30f9bdd5f7ad47
    data.radiusA);
}

function addNut(groups: any, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  groups.Nut.add(data.nodeId, data.treeIndex, centerA, centerB,
    data.radiusA, data.rotationAngle);
}

function addRing(groups: any, data: PropertyLoader) {
  localXAxis.copy(xAxis).applyQuaternion(axisRotation.setFromUnitVectors(zAxis, data.normal));
<<<<<<< HEAD
  groups.GeneralRing.add(data.nodeId, data.treeIndex, data.center, data.normal,
=======
  groups.GeneralRing.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
>>>>>>> e160f545c56e2180472eb73add30f9bdd5f7ad47
    localXAxis, data.radiusB, data.radiusB, data.radiusB - data.radiusA);
}

function addSphere(groups: any, data: PropertyLoader) {
<<<<<<< HEAD
  groups.SphericalSegment.add(data.nodeId, data.treeIndex, data.center, zAxis,
=======
  groups.SphericalSegment.add(data.nodeId, data.treeIndex, data.color, data.center, zAxis,
>>>>>>> e160f545c56e2180472eb73add30f9bdd5f7ad47
  data.radiusA, 2 * data.radiusA);
}

export { addBox, addCircle, addNut, addRing, addSphere };
