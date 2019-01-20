import * as THREE from 'three';
import NutGroup from '../geometry/NutGroup';
import { parsePrimitiveColor, parsePrimitiveInfo, parsePrimitiveNodeId, parsePrimitiveTreeIndex } from './parseUtils';
const type = 'nut';

const color = new THREE.Color();
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

function count(geometries: any[]): number {
  return geometries.reduce(
    (total, geometry) => { return geometry.type === type ? total + 1 : total; }, 0);
}

export default function parse(geometries: any[]): NutGroup|null {
  const group = new NutGroup(count(geometries));
  if (group.capacity === 0) {
    return null;
  }
  const objects = geometries.filter(geometry => geometry.type === type);

  objects.forEach(geometry => {
    const primitiveInfo = parsePrimitiveInfo(geometry.primitiveInfo);

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    const centerA = geometry.primitiveInfo[geometry.type].centerA;
    const centerB = geometry.primitiveInfo[geometry.type].centerB;
    const radius = geometry.primitiveInfo[geometry.type].radius;
    const rotationAngle = geometry.primitiveInfo[geometry.type].rotationAngle;

    vector1.set(centerA.x, centerA.y, centerA.z);
    vector2.set(centerB.x, centerB.y, centerB.z);
    group.add(nodeId, treeIndex, color, centerA, centerB, radius, rotationAngle);
  });
  return group;
}
