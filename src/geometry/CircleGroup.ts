// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';
import { zAxis } from '../constants';

export function computeCircleBoundingBox(
  center: THREE.Vector3,
  normal: THREE.Vector3,
  radius: number,
  box: THREE.Box3,
) {
  normal.normalize();
  dot.multiplyVectors(normal, normal);
  const twoRadius = 2 * radius;
  const size = dot.set(
    twoRadius * Math.sqrt(1 - dot.x),
    twoRadius * Math.sqrt(1 - dot.y),
    twoRadius * Math.sqrt(1 - dot.z),
  );

  return box.setFromCenterAndSize(center, size);
}

// reusable variables
const dot = new THREE.Vector3();
const quaternion = new THREE.Quaternion();
const normalMatrix = new THREE.Matrix3();
const transformedCenter = new THREE.Vector3();
const transformedNormal = new THREE.Vector3();
const normal = new THREE.Vector3();
const center = new THREE.Vector3();
const scale = new THREE.Vector3();

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
    quaternion.setFromUnitVectors(zAxis, this.getNormal(normal, index));
    const twoRadius = 2 * this.getRadius(index);
    scale.set(twoRadius, twoRadius, 1);
    return outputMatrix.compose(
      this.getCenter(center, index),
      quaternion, // Rotation
      scale, // Scale
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    normalMatrix.setFromMatrix4(matrix);
    transformedCenter.copy(this.getCenter(center, index)).applyMatrix4(matrix);
    transformedNormal.copy(this.getNormal(normal, index)).applyMatrix3(normalMatrix);
    const scaling = matrix.getMaxScaleOnAxis();
    const radius = scaling * this.getRadius(index);

    return computeCircleBoundingBox(
      transformedCenter,
      transformedNormal,
      radius,
      box,
    );
  }
}
