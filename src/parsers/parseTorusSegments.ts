import * as THREE from 'three';
import TorusSegmentGroup from '../geometry/TorusSegmentGroup';
import { parsePrimitiveColor, parsePrimitiveInfo, parsePrimitiveNodeId, parsePrimitiveTreeIndex } from './parseUtils';
const type = 'torusSegment';
const types = [type, 'torus'];
const color = new THREE.Color();
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

function count(geometries: any[]): number {
  return geometries.reduce(
    (total, geometry) => { return types.indexOf(geometry.type) > -1 ? total + 1 : total; }, 0);
}

export default function parse(geometries: any[]): TorusSegmentGroup|null {
  const group = new TorusSegmentGroup(count(geometries));
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
    const tubeRadius = geometry.primitiveInfo[geometry.type].tubeRadius;
    let angle = 0.0;
    let arcAngle = 2 * Math.PI;

    if (geometry.type === 'torusSegment') {
      // torusSegment has two more properties
      angle = geometry.primitiveInfo[geometry.type].angle;
      arcAngle = geometry.primitiveInfo[geometry.type].arcAngle;
    }

    vector1.set(center.x, center.y, center.z);
    vector2.set(normal.x, normal.y, normal.z);
    group.add(nodeId, treeIndex, color, vector1, vector2, radius, tubeRadius, angle, arcAngle);
  });
  return group;
}
