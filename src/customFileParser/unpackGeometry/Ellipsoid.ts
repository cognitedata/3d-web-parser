import { RenderedGeometryGroups } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';
import { zAxis } from '../../constants';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addClosedEllipsoidSegment(groups: RenderedGeometryGroups, data: PropertyLoader) {
  groups.EllipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
    data.radiusB, data.height);
  // And something else
}

function addEllipsoid(groups: RenderedGeometryGroups, data: PropertyLoader) {
  groups.EllipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
    data.radiusB, data.radiusB * 2);
  // And something else
}

function addOpenEllipsoidSegment(groups: RenderedGeometryGroups, data: PropertyLoader) {
  groups.EllipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
    data.radiusB, data.radiusB * 2);
}

export { addClosedEllipsoidSegment, addEllipsoid, addOpenEllipsoidSegment };
