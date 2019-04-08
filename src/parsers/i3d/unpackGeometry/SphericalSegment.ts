// Copyright 2019 Cognite AS

import PropertyLoader from '../PropertyLoader';
import { FilterOptions } from '../../parseUtils';
import { PrimitiveGroup, CircleGroup, SphericalSegmentGroup } from '../../../geometry/GeometryGroups';
import * as THREE from 'three';

const globalCenterA = new THREE.Vector3();

function addOpenSphericalSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                 filterOptions?: FilterOptions) {
  (groups.SphericalSegment as SphericalSegmentGroup).add(data.nodeId, data.treeIndex, data.center, data.normal,
    data.radiusA, data.height, filterOptions);
}

function addClosedSphericalSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                   filterOptions?: FilterOptions) {
  addOpenSphericalSegment(groups, data, filterOptions);
  const length = data.radiusA - data.height;
  const circleRadius = Math.sqrt(Math.pow(data.radiusA, 2) - Math.pow(length, 2));
  globalCenterA.copy(data.normal).normalize().multiplyScalar(length).add(data.center);
  (groups.Circle as CircleGroup).add(
    data.nodeId, data.treeIndex, globalCenterA, data.normal, circleRadius, filterOptions);
}

export { addClosedSphericalSegment, addOpenSphericalSegment };
