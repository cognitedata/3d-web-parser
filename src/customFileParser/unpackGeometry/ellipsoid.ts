import { SectorInformation, GeometryGroups } from '../sharedFileParserTypes';
import DataLoader from '../DataLoader';
import { zAxis } from '../../constants';
import * as THREE from 'three';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function addClosedEllipsoidSegment(groups: GeometryGroups, data: DataLoader) {
  groups.ellipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
    data.radiusB, data.height);
  // And something else
}

function addEllipsoid(groups: GeometryGroups, data: DataLoader) {
  groups.ellipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
    data.radiusB, data.radiusB * 2);
  // And something else
}

function addOpenEllipsoidSegment(groups: GeometryGroups, data: DataLoader) {
  groups.ellipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
    data.radiusB, data.radiusB * 2);
}

export { addClosedEllipsoidSegment, addEllipsoid, addOpenEllipsoidSegment };
