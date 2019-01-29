// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';
import { computeCircleBoundingBox } from './CircleGroup';

// reusable variables
const normalMatrix = new THREE.Matrix3();
const transformedCenter = new THREE.Vector3();
const transformedNormal = new THREE.Vector3();
const circleCenter = new THREE.Vector3();
const reusableBox = new THREE.Box3();
const center = new THREE.Vector3();
const normal = new THREE.Vector3();

export default class EllipsoidSegmentGroup extends PlaneGroup {
  static type = 'EllipsoidSegment';
  public horizontalRadius: Float32Array;
  public verticalRadius: Float32Array;
  public height: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.height = new Float32Array(capacity);
    this.horizontalRadius = new Float32Array(capacity);
    this.verticalRadius = new Float32Array(capacity);
  }

  setHeight(value: number, index: number) {
    this.height[index] = value;
  }

  getHeight(index: number): number {
    return this.height[index];
  }

  setHorizontalRadius(value: number, index: number) {
    this.horizontalRadius[index] = value;
  }

  getHorizontalRadius(index: number): number {
    return this.horizontalRadius[index];
  }

  setVerticalRadius(value: number, index: number) {
    this.verticalRadius[index] = value;
  }

  getVerticalRadius(index: number): number {
    return this.verticalRadius[index];
  }

  // @ts-ignore
  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    horizontalRadius: number,
    verticalRadius: number,
    height: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setHorizontalRadius(horizontalRadius, this.count);
    this.setVerticalRadius(verticalRadius, this.count);
    this.setHeight(height, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();

    normalMatrix.setFromMatrix4(matrix);

    transformedCenter.copy(this.getCenter(center, index)).applyMatrix4(matrix);
    transformedNormal
      .copy(this.getNormal(normal, index))
      .applyMatrix3(normalMatrix)
      .normalize();

    const height = this.getHeight(index);
    const hRadius = this.getHorizontalRadius(index);
    const vRadius = this.getVerticalRadius(index);

    const segments = 16;
    const step = hRadius / segments;
    for (let z = vRadius - height; z < vRadius; z += step) {
      const circleRadius = Math.sqrt(vRadius * vRadius - z * z) * hRadius / vRadius;
      circleCenter.copy(transformedNormal).multiplyScalar(z).add(transformedCenter);

      box.union(
        computeCircleBoundingBox(
          circleCenter,
          transformedNormal,
          circleRadius,
          reusableBox,
        ),
      );
    }

    // union the point which maximizes z
    box.expandByPoint(
      circleCenter.copy(transformedNormal).multiplyScalar(vRadius).add(transformedCenter)
    );

    return box;
  }
}
