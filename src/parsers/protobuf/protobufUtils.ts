import * as THREE from 'three';

let hasWarnedAboutMissingColor = false;
// reusable variables
const globalVector = new THREE.Vector3();

export function parsePrimitiveNodeId(data: any): number {
  return Number(data.nodes[0].properties[0].nodeId);
}

export function parsePrimitiveTreeIndex(data: any): number {
  return Number(data.nodes[0].properties[0].treeIndex);
}

export function parsePrimitiveColor(data: any): any {
  if (data.properties && data.properties.color) {
    return data.properties.color.rgb;
  }
  if (data.nodes[0].properties[0].color) {
    return data.nodes[0].properties[0].color.rgb;
  }
  if (!hasWarnedAboutMissingColor) {
    hasWarnedAboutMissingColor = true;
    console.warn(
      '3d-web-parser encountered node with missing color while loading',
      '(using #ff00ff to highlight objects with missing color).',
    );
  }
  return 0xff00ff;
}

export interface MatchingGeometries {
  count: number;
  geometries: any[];
}

export function getPrimitiveType(primitiveInfo: any): string {
  return Object.keys(primitiveInfo)[0];
}

export function isPrimitive(geometry: any): boolean {
  return geometry.primitiveInfo != null;
}

export function normalizeRadians (angle: number, lowerBound = -Math.PI, upperBound = Math.PI): number {
  while (angle < lowerBound) {
    angle += 2 * Math.PI;
  }
  while (angle > upperBound) {
    angle -= 2 * Math.PI;
  }
  return angle;
}

// this returns angle between 0 and 2π
export function angleBetweenVector3s(v1: THREE.Vector3, v2: THREE.Vector3, up: THREE.Vector3): number {
  const angle = v1.angleTo(v2);
  const right = globalVector.copy(v1).cross(up);
  const moreThanPi = right.dot(v2) < 0;
  return moreThanPi ? 2 * Math.PI - angle : angle;
}

export function parseInstancedMeshTransformMatrix(target: THREE.Matrix4, transformMatrix: number[]): THREE.Matrix4 {
  if (transformMatrix.length === 0) {
    target.identity();
    return target;
  }

  const [
    n11,
    n21,
    n31,
    n12,
    n22,
    n32,
    n13,
    n23,
    n33,
    n14,
    n24,
    n34,
  ] = transformMatrix;
  target.set(
    n11,
    n12,
    n13,
    n14,
    n21,
    n22,
    n23,
    n24,
    n31,
    n32,
    n33,
    n34,
    0,
    0,
    0,
    1,
  );
  return target;
}
