import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { PrimitiveGroup, EllipsoidSegmentGroup, CircleGroup } from '../../geometry/GeometryGroups';
import { FilterOptions } from '../../parsers/parseUtils';

const centerA = new THREE.Vector3();

function addOpenEllipsoidSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                 filterOptions?: FilterOptions) {
  (groups.EllipsoidSegment as EllipsoidSegmentGroup).add(data.nodeId, data.treeIndex, data.center, data.normal,
    data.radiusA, data.radiusB, data.radiusB * 2, filterOptions);
}

function addClosedEllipsoidSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                   filterOptions?: FilterOptions) {
  addOpenEllipsoidSegment(groups, data, filterOptions);
  const length = data.radiusB - data.height;
  const circleRadius =
        Math.sqrt(Math.pow(data.radiusB, 2) - Math.pow(length, 2)) * data.radiusA / data.radiusB;
  centerA.copy(data.normal).normalize().multiplyScalar(length).add(data.center);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerA, data.normal, circleRadius, filterOptions);
}

function addEllipsoid(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  data.height = 2 * data.radiusB;
  addOpenEllipsoidSegment(groups, data, filterOptions);
}

export { addClosedEllipsoidSegment, addEllipsoid, addOpenEllipsoidSegment };
