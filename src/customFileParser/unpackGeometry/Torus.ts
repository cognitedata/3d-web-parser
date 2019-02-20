import PropertyLoader from '../PropertyLoader';

function addOpenTorusSegment(groups: {[name: string]: any}, data: PropertyLoader) {
  groups.TorusSegment.add(data.nodeId, data.treeIndex, data.center, data.normal, data.radiusA,
    data.radiusB, data.rotationAngle, data.arcAngle);
}

function addClosedTorusSegment(groups: {[name: string]: any}, data: PropertyLoader) {
  addOpenTorusSegment(groups, data);
  // groups.circle.add
  // groups.circle.add
}

function addTorus(groups: {[name: string]: any}, data: PropertyLoader) {
  groups.TorusSegment.add(data.nodeId, data.treeIndex, data.center, data.normal,
    data.radiusA, data.radiusB, 0, Math.PI * 2);
}

export { addClosedTorusSegment, addOpenTorusSegment, addTorus };
