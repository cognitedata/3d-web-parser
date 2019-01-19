// Copyright 2019 Cognite AS

import * as THREE from 'three';
import EllipsoidGroup from './EllipsoidGroup';

export default class EllipsoidSegmentGroup extends EllipsoidGroup {
  static type = 'EllipsoidSegment';
  public height: Float32Array;
  public isClosed: Uint8Array;
  constructor(capacity: number) {
    super(capacity);
    this.height = new Float32Array(capacity);
    this.isClosed = new Uint8Array(capacity);
  }

  setHeight(value: number, index: number) {
    this.height[index] = value;
  }

  getHeight(index: number): number {
    return this.height[index];
  }

  setIsClosed(value: boolean, index: number) {
    this.isClosed[index] = value ? 1 : 0;
  }

  getIsClosed(index: number): boolean {
    return this.isClosed[index] === 1 ? true : false;
  }

  // @ts-ignore
  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    hRadius: number,
    vRadius: number,
    height: number,
    isClosed: boolean,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setHRadius(hRadius, this.count);
    this.setVRadius(vRadius, this.count);
    this.setHeight(height, this.count);
    this.setIsClosed(isClosed, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return box;
  }
}
