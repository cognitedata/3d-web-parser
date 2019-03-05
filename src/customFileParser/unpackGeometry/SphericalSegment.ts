import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { PrimitiveGroup, CircleGroup, SphericalSegmentGroup } from '../../geometry/GeometryGroups';

const centerA = new THREE.Vector3();

function addOpenSphericalSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  (groups.SphericalSegment as SphericalSegmentGroup).add(data.nodeId, data.treeIndex, data.center, data.normal,
    data.radiusA, data.height);
}

function addClosedSphericalSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader) {
  addOpenSphericalSegment(groups, data);
  const length = data.radiusA - data.height;
  const circleRadius = Math.sqrt(Math.pow(data.radiusA, 2) - Math.pow(length, 2));
  centerA.copy(data.normal).normalize().multiplyScalar(length).add(data.center);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerA, data.normal, circleRadius);
}

export { addClosedSphericalSegment, addOpenSphericalSegment };
