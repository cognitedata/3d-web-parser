// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';
import { zAxis } from '../constants';

// reusable variables
const globalDot = new THREE.Vector3();
const globalQuaternion = new THREE.Quaternion();
const globalNormalMatrix = new THREE.Matrix3();
const globalTransformedCenter = new THREE.Vector3();
const globalTransformedNormal = new THREE.Vector3();
const globalNormal = new THREE.Vector3();
const globalCenter = new THREE.Vector3();
const globalScale = new THREE.Vector3();

export function computeCircleBoundingBox(
  center: THREE.Vector3,
  normal: THREE.Vector3,
  radius: number,
  box: THREE.Box3,
) {
  normal.normalize();
  globalDot.multiplyVectors(normal, normal);
  const twoRadius = 2 * radius;
  const size = globalDot.set(
    twoRadius * Math.sqrt(1 - globalDot.x),
    twoRadius * Math.sqrt(1 - globalDot.y),
    twoRadius * Math.sqrt(1 - globalDot.z),
  );

  return box.setFromCenterAndSize(center, size);
}

export default class CircleGroup extends PlaneGroup {
  public radius: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'Circle';
    this.radius = new Float32Array(capacity);
  }

  setRadius(value: number, index: number) {
    this.radius[index] = value;
  }

  getRadius(index: number): number {
    return this.radius[index];
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setRadius(radius, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    globalQuaternion.setFromUnitVectors(zAxis, this.getNormal(globalNormal, index));
    const twoRadius = 2 * this.getRadius(index);
    globalScale.set(twoRadius, twoRadius, 1);
    return outputMatrix.compose(
      this.getCenter(globalCenter, index),
      globalQuaternion, // Rotation
      globalScale, // Scale
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    globalNormalMatrix.setFromMatrix4(matrix);
    globalTransformedCenter.copy(this.getCenter(globalCenter, index)).applyMatrix4(matrix);
    globalTransformedNormal.copy(this.getNormal(globalNormal, index)).applyMatrix3(globalNormalMatrix);
    const scaling = matrix.getMaxScaleOnAxis();
    const radius = scaling * this.getRadius(index);

    return computeCircleBoundingBox(
      globalTransformedCenter,
      globalTransformedNormal,
      radius,
      box,
    );
  }
}
