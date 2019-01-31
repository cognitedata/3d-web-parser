// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';
import { computeCircleBoundingBox } from './CircleGroup';

// reusable variables
const globalNormalMatrix = new THREE.Matrix3();
const globalReusableBox = new THREE.Box3();
const globalCenter = new THREE.Vector3();
const globalNormal = new THREE.Vector3();
const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();

export default class EccentricConeGroup extends BaseCylinderGroup {
    public radiusA: Float32Array;
    public radiusB: Float32Array;
    public normal: Float32Array;

    constructor(capacity: number) {
    super(capacity);
    this.type = 'EccentricCone';
    this.radiusA = new Float32Array(capacity);
    this.radiusB = new Float32Array(capacity);
    this.normal = new Float32Array(3 * capacity);
    this.hasCustomTransformAttributes = true;

    this.attributes.push({
      name: 'a_radiusA',
      array: this.radiusA,
      itemSize: 1,
    });

    this.attributes.push({
      name: 'a_radiusB',
      array: this.radiusB,
      itemSize: 1,
    });

    this.attributes.push({
      name: 'a_normal',
      array: this.normal,
      itemSize: 3,
    });
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
    return outputMatrix.identity();
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    globalNormalMatrix.setFromMatrix4(matrix);
    const scaling = matrix.getMaxScaleOnAxis();

    box.makeEmpty();
    globalNormal.copy(this.getNormal(globalNormal, index)).applyMatrix3(globalNormalMatrix).normalize();

    // A
    globalCenter.copy(this.getCenterA(globalCenterA, index)).applyMatrix4(matrix);
    let radius = scaling * this.getRadiusA(index);
    box.union(computeCircleBoundingBox(globalCenter, globalNormal, radius, globalReusableBox));

    // B
    globalCenter.copy(this.getCenterB(globalCenterB, index)).applyMatrix4(matrix);
    radius = scaling * this.getRadiusB(index);
    box.union(computeCircleBoundingBox(globalCenter, globalNormal, radius, globalReusableBox));

    return box;
  }
}
