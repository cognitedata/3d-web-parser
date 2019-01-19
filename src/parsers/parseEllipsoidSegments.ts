import * as THREE from 'three';
import CircleGroup from '../geometry/CircleGroup';
import { parsePrimitiveColor, parsePrimitiveInfo, parsePrimitiveNodeId, parsePrimitiveTreeIndex } from './parseUtils';

const color = new THREE.Color();
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

function countCircles(geometries: any[]): number {
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

export default function parseCircles(geometries: any[]): CircleGroup|null {
  const numCircles = countCircles(geometries);
  if (numCircles === 0) {
    return null;
  }
  const circles = geometries.filter(object => object.type === 'circle');
  // const circles = geometries.filter(object => object.type === 'circle');

  const count = circles.length;
  const group = new CircleGroup(count);

  circles.forEach(circle => {
    const primitiveInfo = parsePrimitiveInfo(circle.primitiveInfo);

    const nodeId = parsePrimitiveNodeId(circle);
    const treeIndex = parsePrimitiveTreeIndex(circle);
    const center = circle.primitiveInfo.circle.center;
    const normal = circle.primitiveInfo.circle.normal;
    const radius = circle.primitiveInfo.circle.radius;
    vector1.set(center.x, center.y, center.z);
    vector2.set(normal.x, normal.y, normal.z);
    console.log('Color thing: ', parsePrimitiveColor(circle));
    color.setHex(parsePrimitiveColor(circle));
    group.add(nodeId, treeIndex, color, vector1, vector2, radius);
  });
  return group;
}
