import { RenderedPrimitiveGroups } from '../sharedFileParserTypes';
import PropertyLoader from '../PropertyLoader';

function addOpenTorusSegment(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  groups.TorusSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
    data.radiusB, data.rotationAngle, data.arcAngle);
}

function addClosedTorusSegment(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  addOpenTorusSegment(groups, data);
  // groups.circle.add
  // groups.circle.add
}

function addTorus(groups: RenderedPrimitiveGroups, data: PropertyLoader) {
  groups.TorusSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    data.radiusA, data.radiusB, 0, Math.PI * 2);
}

export { addClosedTorusSegment, addOpenTorusSegment, addTorus };
