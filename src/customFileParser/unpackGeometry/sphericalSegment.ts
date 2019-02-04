import { GeometryGroups } from '../sharedFileParserTypes';
import DataLoader from '../DataLoader';

function addOpenSphericalSegment(groups: GeometryGroups, data: DataLoader) {
  groups.sphericalSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    data.radiusA, data.height);
}

function addClosedSphericalSegment(groups: GeometryGroups, data: DataLoader) {
  addOpenSphericalSegment(groups, data);
  groups.circle.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA);
}

export { addClosedSphericalSegment, addOpenSphericalSegment };
