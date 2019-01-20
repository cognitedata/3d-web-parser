import * as THREE from 'three';
import SphericalSegmentGroup from '../geometry/SphericalSegmentGroup';
import { parsePrimitiveColor, parsePrimitiveInfo, parsePrimitiveNodeId, parsePrimitiveTreeIndex } from './parseUtils';
const type = 'sphericalSegment';
const types = [type, 'sphere'];
const color = new THREE.Color();
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

function count(geometries: any[]): number {
  return geometries.reduce(
    (total, geometry) => { return types.indexOf(geometry.type) > -1 ? total + 1 : total; }, 0);
}

export default function parse(geometries: any[]): SphericalSegmentGroup|null {
  const group = new SphericalSegmentGroup(count(geometries));
  if (group.capacity === 0) {
    return null;
  }
  const objects = geometries.filter(geometry => types.indexOf(geometry.type) > -1);

  objects.forEach(geometry => {
    const primitiveInfo = parsePrimitiveInfo(geometry.primitiveInfo);

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    const center = geometry.primitiveInfo[geometry.type].center;
    const normal = geometry.primitiveInfo[geometry.type].radius;
    const radius = geometry.primitiveInfo[geometry.type].radius;
    let height = 2 * radius;
    let isClosed = false;

    if (geometry.type === 'sphericalSegment') {
      // sphericalSegment has two more properties
      height = geometry.primitiveInfo[geometry.type].height;
      isClosed = geometry.primitiveInfo[geometry.type].isClosed;
    }

    vector1.set(center.x, center.y, center.z);
    vector2.set(normal.x, normal.y, normal.z);
    group.add(nodeId, treeIndex, color, vector1, vector2, radius, height, isClosed);
  });
  return group;
}
