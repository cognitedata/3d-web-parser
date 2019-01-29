// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';
import { computeCircleBoundingBox } from './CircleGroup';

// reusable variables
const center = new THREE.Vector3();
const normal = new THREE.Vector3();
const normalMatrix = new THREE.Matrix3();
const reusableBox = new THREE.Box3();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

export default class ConeGroup extends BaseCylinderGroup {
    public radiusA: Float32Array;
    public radiusB: Float32Array;
    public angle: Float32Array;
    public arcAngle: Float32Array;

    constructor(capacity: number) {
    super(capacity);
    this.type = 'Cone';
    this.radiusA = new Float32Array(capacity);
    this.radiusB = new Float32Array(capacity);
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
    angle: number = 0,
    arcAngle: number = 2 * Math.PI,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenterA(centerA, this.count);
    this.setCenterB(centerB, this.count);
    this.setRadiusA(radiusA, this.count);
    this.setRadiusB(radiusB, this.count);
    this.setAngle(angle, this.count);
    this.setArcAngle(arcAngle, this.count);

    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix.identity();
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    normalMatrix.setFromMatrix4(matrix);
    const scaling = matrix.getMaxScaleOnAxis();

    normal
      .subVectors(this.getCenterA(centerA, index), this.getCenterB(centerB, index))
      .applyMatrix3(normalMatrix)
      .normalize();

    box.makeEmpty();

    // A
    center.copy(this.getCenterA(centerA, index)).applyMatrix4(matrix);
    let radius = scaling * this.getRadiusA(index);
    box.union(computeCircleBoundingBox(center, normal, radius, reusableBox));

    // B
    center.copy(this.getCenterB(centerB, index)).applyMatrix4(matrix);
    radius = scaling * this.getRadiusB(index);
    box.union(computeCircleBoundingBox(center, normal, radius, reusableBox));

    return box;
  }
}
