// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';

export default class EllipsoidSegmentGroup extends PlaneGroup {
  public horizontalRadius: Float32Array;
  public verticalRadius: Float32Array;
  public height: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'EllipsoidSegment';
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
    return box;
  }
}
