import * as THREE from 'three';

// reusable variables
const globalVector = new THREE.Vector3();

export function parsePrimitiveNodeId(data: any): number {
  return Number(data.nodes[0].properties[0].nodeId);
}

export function parsePrimitiveTreeIndex(data: any): number {
  return Number(data.nodes[0].properties[0].treeIndex);
}

export function parsePrimitiveColor(data: any): any {
  if (data.properties) {
    return data.properties.color.rgb;
  }
  return data.nodes[0].properties[0].color.rgb;
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
