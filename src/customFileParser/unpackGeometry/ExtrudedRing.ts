import { RenderedPrimitiveGroups } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { xAxis, zAxis } from '../../constants';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

const vertex = new THREE.Vector3();
const vertex1 = new THREE.Vector3();
const vertex2 = new THREE.Vector3();
const vertex3 = new THREE.Vector3();
const quadNorm = new THREE.Vector3();
const axisRotation = new THREE.Quaternion();
const localXAxis = new THREE.Vector3();

function addOpenExtrudedRingSegment(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  localXAxis.copy(xAxis).applyQuaternion(axisRotation.setFromUnitVectors(zAxis, data.normal));

  groups.GeneralRing.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal,
    localXAxis, data.radiusB, data.radiusB, data.radiusB - data.radiusA,
    data.rotationAngle, data.arcAngle);
  groups.GeneralRing.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal,
    localXAxis, data.radiusB, data.radiusB, data.radiusB - data.radiusA,
    data.rotationAngle, data.arcAngle);
  groups.Cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
    data.radiusA, data.rotationAngle, data.arcAngle);
  groups.Cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusB,
    data.radiusB, data.rotationAngle, data.arcAngle);
}

function addClosedExtrudedRingSegment(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  addOpenExtrudedRingSegment(groups, data);

  // quad 1
  quadNorm.copy(centerA).sub(centerB).normalize();
  axisRotation.setFromUnitVectors(zAxis, quadNorm);
  const quadOneAngle = data.rotationAngle;
  vertex.set(Math.cos(quadOneAngle), Math.sin(quadOneAngle), 0).applyQuaternion(axisRotation).normalize();
  vertex1.copy(vertex).multiplyScalar(data.radiusB).add(centerA);
  vertex2.copy(vertex).multiplyScalar(data.radiusA).add(centerB);
  vertex3.copy(vertex).multiplyScalar(data.radiusB).add(centerB);

  groups.Quad.add(data.nodeId, data.treeIndex, data.color, vertex2, vertex1, vertex3);

  // quad 2
  quadNorm.copy(centerA).sub(centerB).normalize();
  axisRotation.setFromUnitVectors(zAxis, quadNorm);
  const quadTwoAngle = data.rotationAngle + data.arcAngle;
  vertex.set(Math.cos(quadTwoAngle), Math.sin(quadTwoAngle), 0).applyQuaternion(axisRotation).normalize();
  vertex1.copy(vertex).multiplyScalar(data.radiusB).add(centerA);
  vertex2.copy(vertex).multiplyScalar(data.radiusA).add(centerB);
  vertex3.copy(vertex).multiplyScalar(data.radiusB).add(centerB);

  // Note that vertexes 2 and 1 are flipped
  groups.Quad.add(data.nodeId, data.treeIndex, data.color, vertex1, vertex2, vertex3);
}

function addExtrudedRing(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  data.rotationAngle = 0;
  data.arcAngle = Math.PI * 2;
  // Don't need the quads, so call addOpenExtrudedRingSegment
  addOpenExtrudedRingSegment(groups, data);
}

export { addExtrudedRing, addClosedExtrudedRingSegment, addOpenExtrudedRingSegment };
