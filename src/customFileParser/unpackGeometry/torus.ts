import { SectorInformation, GeometryGroups } from '../sharedFileParserTypes';
import DataLoader from '../DataLoader';
import { zAxis } from '../../constants';
import * as THREE from 'three';

function addOpenTorusSegment(groups: GeometryGroups, data: DataLoader) {
  groups.torusSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
    data.radiusB, data.rotationAngle, data.arcAngle);
}

function addClosedTorusSegment(groups: GeometryGroups, data: DataLoader) {
  addOpenTorusSegment(groups, data);
  // groups.circle.add
  // groups.circle.add
}

function addTorus(groups: GeometryGroups, data: DataLoader) {
  groups.torusSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
    data.radiusA, data.radiusB, 0, Math.PI * 2);
}

export { addClosedTorusSegment, addOpenTorusSegment, addTorus };
