import { RenderedPrimitiveGroups } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';

const centerA = new THREE.Vector3();

function addOpenSphericalSegment(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  groups.SphericalSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    data.radiusA, data.height);
}

function addClosedSphericalSegment(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  addOpenSphericalSegment(groups, data);
  const length = data.radiusA - data.height;
  const circleRadius = Math.sqrt(Math.pow(data.radiusA, 2) - Math.pow(length, 2));
  centerA.copy(data.normal).normalize().multiplyScalar(length).add(data.center);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, circleRadius);
}

export { addClosedSphericalSegment, addOpenSphericalSegment };
