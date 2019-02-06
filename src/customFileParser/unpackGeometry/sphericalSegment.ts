import { RenderedGeometryGroups } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';

function addOpenSphericalSegment(groups: RenderedGeometryGroups, data: PropertyLoader) {
  groups.SphericalSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    data.radiusA, data.height);
}

function addClosedSphericalSegment(groups: RenderedGeometryGroups, data: PropertyLoader) {
  addOpenSphericalSegment(groups, data);
  groups.Circle.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA);
}

export { addClosedSphericalSegment, addOpenSphericalSegment };
