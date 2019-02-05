// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';
import { zAxis } from './../constants';
import { FilterOptions } from '../parsers/parseUtils';

// reusable variables
const firstRotation = new THREE.Quaternion();
const secondRotation = new THREE.Quaternion();
const fullMatrix = new THREE.Matrix4();

const globalNormal = new THREE.Vector3();
const globalScale = new THREE.Vector3();
const globalCenter = new THREE.Vector3();
const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();
const globalPoint = new THREE.Vector3();

export default class NutGroup extends BaseCylinderGroup {
    public radius: Float32Array;
    public rotationAngle: Float32Array;

    constructor(capacity: number) {
    super(capacity);
    this.type = 'Nut';
    this.radius = new Float32Array(capacity);
    this.rotationAngle = new Float32Array(capacity);
  }

  setRadius(value: number, index: number) {
    this.radius[index] = value;
  }

  getRadius(index: number): number {
    return this.radius[index];
  }

  setRotationAngle(value: number, index: number) {
    this.rotationAngle[index] = value;
  }

  getRotationAngle(index: number): number {
    return this.rotationAngle[index];
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radius: number,
    rotationAngle: number,
    filterOptions?: FilterOptions,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenterA(centerA, this.count);
    this.setCenterB(centerB, this.count);
    this.setRadius(radius, this.count);
    this.setRotationAngle(rotationAngle, this.count);

    this.count += 1;

    if (filterOptions) {
      this.filterLastObject(filterOptions);
    }
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    this.getCenterA(globalCenterA, index);
    this.getCenterB(globalCenterB, index);
    globalCenter.addVectors(globalCenterA, globalCenterB).multiplyScalar(0.5);
    globalNormal.subVectors(globalCenterA, globalCenterB);
    const height = globalNormal.length();
    firstRotation.setFromAxisAngle(zAxis, this.getRotationAngle(index));
    secondRotation.setFromUnitVectors(zAxis, globalNormal.normalize());

    const diameter = 2 * this.getRadius(index);
    globalScale.set(diameter, diameter, height);
    return outputMatrix.compose(
      globalCenter,
      secondRotation.multiply(firstRotation),
      globalScale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    this.computeModelMatrix(fullMatrix, index).premultiply(matrix);
    let angle = this.getRotationAngle(index) + Math.PI / 6;

    for (let i = 0; i < 6; i++, angle += Math.PI / 3) {
      const sin = 0.5 * Math.sin(angle);
      const cos = 0.5 * Math.cos(angle);
      globalPoint.set(sin, cos, 0.5).applyMatrix4(fullMatrix);
      box.expandByPoint(globalPoint);
      globalPoint.set(sin, cos, -0.5).applyMatrix4(fullMatrix);
      box.expandByPoint(globalPoint);
    }

    return box;
  }
}
