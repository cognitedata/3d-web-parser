import { RenderedGeometryGroups } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
import { zAxis } from '../../constants';
import * as THREE from 'three';

const centerA = new THREE.Vector3();

function addOpenEllipsoidSegment(groups: RenderedGeometryGroups, data: PropertyLoader) {
  groups.EllipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
    data.radiusB, data.radiusB * 2);
}

function addClosedEllipsoidSegment(groups: RenderedGeometryGroups, data: PropertyLoader) {
  addOpenEllipsoidSegment(groups, data);
  const length = data.radiusB - data.height;
  const circleRadius =
        Math.sqrt(Math.pow(data.radiusB, 2) - Math.pow(length, 2)) * data.radiusA / data.radiusB;
  centerA.copy(data.normal).normalize().multiplyScalar(length).add(data.center);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, circleRadius);
}

function addEllipsoid(groups: RenderedGeometryGroups, data: PropertyLoader) {
  data.height = 2 * data.radiusB;
  addOpenEllipsoidSegment(groups, data);
}

export { addClosedEllipsoidSegment, addEllipsoid, addOpenEllipsoidSegment };