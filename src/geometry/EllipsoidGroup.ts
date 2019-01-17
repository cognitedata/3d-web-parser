// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';

export default class EllipsoidGroup extends PlaneGroup {
  static type = 'Ellipsoid';
  public hRadius: Float32Array;
  public vRadius: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.hRadius = new Float32Array(capacity);
    this.vRadius = new Float32Array(capacity);
  }

  setHRadius(value: number, index: number) {
    this.hRadius[index] = value;
  }

  getHRadius(index: number): number {
    return this.hRadius[index];
  }

  setVRadius(value: number, index: number) {
    this.vRadius[index] = value;
  }

  getVRadius(index: number): number {
    return this.vRadius[index];
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    hRadius: number,
    vRadius: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setHRadius(hRadius, this.count);
    this.setVRadius(vRadius, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 { }
  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 { }
}
