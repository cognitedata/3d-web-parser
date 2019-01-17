// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';

export default class ExtrudedRingGroup extends BaseCylinderGroup {
    static type = 'ExtrudedRing';
    public innerRadius: Float32Array;
    public outerRadius: Float32Array;
    public angle: Float32Array;
    public arcAngle: Float32Array;
    public isClosed: Uint8Array;
  constructor(capacity: number) {
    super(capacity);
    this.innerRadius = new Float32Array(capacity);
    this.outerRadius = new Float32Array(capacity);
    this.isClosed = new Uint8Array(capacity);
    this.angle = new Float32Array(capacity);
    this.arcAngle = new Float32Array(capacity);
  }

  setInnerRadius(value: number, index: number) {
    this.innerRadius[index] = value;
  }

  getInnerRadius(index: number): number {
    return this.innerRadius[index];
  }

  setOuterRadius(value: number, index: number) {
    this.outerRadius[index] = value;
  }

  getOuterRadius(index: number): number {
    return this.outerRadius[index];
  }

  setIsClosed(value: boolean, index: number) {
    this.isClosed[index] = value ? 1 : 0;
  }

  getIsClosed(index: number): boolean {
    return this.isClosed[index] === 1 ? true : false;
  }

  setAngle(value: number, index: number) {
    this.angle[index] = value;
  }

  getAngle(index: number): number {
    return this.angle[index];
  }

  setArcAngle(value: number, index: number) {
    this.arcAngle[index] = value;
  }

  getArcAngle(index: number): number {
    return this.arcAngle[index];
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    innerRadius: number,
    outerRadius: number,
    isClosed: boolean,
    angle: number,
    arcAngle: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenterA(centerA, this.count);
    this.setCenterB(centerB, this.count);
    this.setInnerRadius(innerRadius, this.count);
    this.setOuterRadius(outerRadius, this.count);
    this.setIsClosed(isClosed, this.count);
    this.setAngle(angle, this.count);
    this.setArcAngle(arcAngle, this.count);

    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return box;
  }
}
