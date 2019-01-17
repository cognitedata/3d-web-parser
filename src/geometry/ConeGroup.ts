// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';

export default class ConeGroup extends BaseCylinderGroup {
    static type = 'Cone';
    public radiusA: Float32Array;
    public radiusB: Float32Array;
    public isClosed: Uint8Array;
    public angle: Float32Array;
    public arcAngle: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.radiusA = new Float32Array(capacity);
    this.radiusB = new Float32Array(capacity);
    this.isClosed = new Uint8Array(capacity);
    this.angle = new Float32Array(capacity);
    this.arcAngle = new Float32Array(capacity);
  }

  setRadiusA(value: number, index: number) {
    this.radiusA[index] = value;
  }

  getRadiusA(index: number): number {
    return this.radiusA[index];
  }

  setRadiusB(value: number, index: number) {
    this.radiusB[index] = value;
  }

  getRadiusB(index: number): number {
    return this.radiusB[index];
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
    radiusA: number,
    radiusB: number,
    isClosed: boolean,
    angle: number,
    arcAngle: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenterA(centerA, this.count);
    this.setCenterB(centerB, this.count);
    this.setRadiusA(radiusA, this.count);
    this.setRadiusB(radiusB, this.count);
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
