// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';
import { computeCircleBoundingBox } from './CircleGroup';

// reusable variables
const normalMatrix = new THREE.Matrix3();
const reusableBox = new THREE.Box3();
const center = new THREE.Vector3();
const normal = new THREE.Vector3();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

export default class EccentricConeGroup extends BaseCylinderGroup {
    static type = 'EccentricCone';
    public radiusA: Float32Array;
    public radiusB: Float32Array;
    public normal: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.radiusA = new Float32Array(capacity);
    this.radiusB = new Float32Array(capacity);
    this.normal = new Float32Array(3 * capacity);
    this.hasCustomTransformAttributes = true;
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

  setNormal(source: THREE.Vector3, index: number) {
    this.setVector(source, this.normal, index);
  }

  getNormal(target: THREE.Vector3, index: number) {
    return this.getVector(this.normal, target, index);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radiusA: number,
    radiusB: number,
    normal: THREE.Vector3,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenterA(centerA, this.count);
    this.setCenterB(centerB, this.count);
    this.setRadiusA(radiusA, this.count);
    this.setRadiusB(radiusB, this.count);
    this.setNormal(normal, this.count);

    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    outputMatrix.identity();
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    normalMatrix.setFromMatrix4(matrix);
    const scaling = matrix.getMaxScaleOnAxis();

    box.makeEmpty();
    normal.copy(this.getNormal(normal, index)).applyMatrix3(normalMatrix).normalize();

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
