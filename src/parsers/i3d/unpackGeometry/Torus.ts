// Copyright 2019 Cognite AS

import PropertyLoader from '../PropertyLoader';
import { PrimitiveGroup, TorusSegmentGroup } from '../../../geometry/GeometryGroups';
import { FilterOptions } from '../../parseUtils';

function addOpenTorusSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                             filterOptions?: FilterOptions) {
  (groups.TorusSegment as TorusSegmentGroup).add(data.nodeId, data.treeIndex, data.size, data.center,
    data.normal, data.radiusA, data.radiusB, data.rotationAngle, data.arcAngle, filterOptions);
}

function addClosedTorusSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                               filterOptions?: FilterOptions) {
  addOpenTorusSegment(groups, data, filterOptions);
  // groups.circle.add
  // groups.circle.add
}

function addTorus(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                  filterOptions?: FilterOptions) {
  (groups.TorusSegment as TorusSegmentGroup).add(data.nodeId, data.treeIndex, data.size, data.center,
    data.normal, data.radiusA, data.radiusB, 0, Math.PI * 2, filterOptions);
}

export { addClosedTorusSegment, addOpenTorusSegment, addTorus };
