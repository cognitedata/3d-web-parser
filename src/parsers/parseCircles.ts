import * as THREE from 'three';
import CircleGroup from '../geometry/CircleGroup';
import { parsePrimitiveColor, parsePrimitiveInfo, parsePrimitiveNodeId, parsePrimitiveTreeIndex } from './parseUtils';

const color = new THREE.Color();
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

function count(geometries: any[]): number {
  const numCircles = geometries.reduce(
    (total, geometry) => { return geometry.type === 'circle' ? total + 1 : total; }, 0);

  const numExtraCircles = geometries.reduce((total, geometry) => {
    if (['cylinder', 'cone', 'eccentricCone'].indexOf(geometry.type) > 0) {
      // Found one of them
      const type = Object.keys(geometry.primitiveInfo)[0];
      const isClosed = geometry.primitiveInfo[type].isClosed;
      return total + 2;
    }
    return total;
  }, 0);

  return numCircles + numExtraCircles;
}

export default function parse(geometries: any[]): CircleGroup|null {
  const group = new CircleGroup(count(geometries));
  if (group.capacity === 0) {
    return null;
  }
  const circles = geometries.filter(object => object.type === 'circle');
  // TODO: add handling for cylinders etc

  circles.forEach(geometry => {
    const primitiveInfo = parsePrimitiveInfo(geometry.primitiveInfo);

    const nodeId = parsePrimitiveNodeId(geometry);
    const treeIndex = parsePrimitiveTreeIndex(geometry);
    color.setHex(parsePrimitiveColor(geometry));

    const center = geometry.primitiveInfo.circle.center;
    const normal = geometry.primitiveInfo.circle.normal;
    const radius = geometry.primitiveInfo.circle.radius;
    vector1.set(center.x, center.y, center.z);
    vector2.set(normal.x, normal.y, normal.z);

    group.add(nodeId, treeIndex, color, vector1, vector2, radius);
  });
  return group;
}
