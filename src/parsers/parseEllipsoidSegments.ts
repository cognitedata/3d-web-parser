import * as THREE from 'three';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';
import { parsePrimitiveColor, parsePrimitiveInfo, parsePrimitiveNodeId, parsePrimitiveTreeIndex } from './parseUtils';
const type = 'ellipsoidSegments';
const color = new THREE.Color();
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

function count(geometries: any[]): number {
  return geometries.reduce(
    (total, geometry) => { return [type, 'ellipsoid'].indexOf(geometry.type) > -1 ? total + 1 : total; }, 0);
}

export default function parse(geometries: any[]): EllipsoidSegmentGroup|null {
  const group = new EllipsoidSegmentGroup(count(geometries));
  if (group.capacity === 0) {
    return null;
  }
  const objects = geometries.filter(geometry => [type, 'ellipsoid'].indexOf(geometry.type) > -1);

  objects.forEach(geometry => {
    const primitiveInfo = parsePrimitiveInfo(geometry.primitiveInfo);

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    const center = geometry.primitiveInfo[geometry.type].center;
    const normal = geometry.primitiveInfo[geometry.type].normal;
    const hRadius = geometry.primitiveInfo[geometry.type].horizontalRadius;
    const vRadius = geometry.primitiveInfo[geometry.type].verticalRadius;
    let height = 2 * vRadius;
    let isClosed = false;

    if (geometry.type === 'ellipsoidSegment') {
      // ellipsoidSegment has two more properties
      height = geometry.primitiveInfo[geometry.type].height;
      isClosed = geometry.primitiveInfo[geometry.type].isClosed;
    }

    vector1.set(center.x, center.y, center.z);
    vector2.set(normal.x, normal.y, normal.z);
    color.setHex(parsePrimitiveColor(geometry));
    group.add(nodeId, treeIndex, color, vector1, vector2, hRadius, vRadius, height, isClosed);
  });
  return group;
}
