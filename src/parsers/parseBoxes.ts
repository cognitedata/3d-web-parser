import * as THREE from 'three';
import BoxGroup from '../geometry/BoxGroup';
import { parsePrimitiveColor, parsePrimitiveInfo, parsePrimitiveNodeId, parsePrimitiveTreeIndex } from './parseUtils';

const color = new THREE.Color();
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

function count(geometries: any[]): number {
  return geometries.reduce( (total, geometry) => { return geometry.type === 'box' ? total + 1 : total; }, 0);
}

export default function parseBoxes(geometries: any[]): BoxGroup|null {
  const group = new BoxGroup(count(geometries));
  if (group.capacity === 0) {
    return null;
  }

  const boxes = geometries.filter(object => object.type === 'box');
  boxes.forEach(geometry => {
    const primitiveInfo = parsePrimitiveInfo(geometry.primitiveInfo);

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    const center = geometry.primitiveInfo.box.center;
    const normal = geometry.primitiveInfo.box.normal;
    const delta = geometry.primitiveInfo.box.delta;
    const angle = geometry.primitiveInfo.box.angle;

    vector1.set(center.x, center.y, center.z);
    vector2.set(normal.x, normal.y, normal.z);
    vector3.set(delta.x, delta.y, delta.z);

    group.add(nodeId, treeIndex, color, vector1, vector2, angle, vector3);
  });
  return group;
}
