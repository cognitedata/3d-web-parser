// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';
import { zAxis } from './../constants';

// reusable variables
const firstRotation = new THREE.Quaternion();
const secondRotation = new THREE.Quaternion();
const fullMatrix = new THREE.Matrix4();

const normal = new THREE.Vector3();
const scale = new THREE.Vector3();
const center = new THREE.Vector3();
const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();
const point = new THREE.Vector3();

export default class NutGroup extends BaseCylinderGroup {
    static type = 'Nut';
    public radius: Float32Array;
    public rotationAngle: Float32Array;
  constructor(capacity: number) {
    super(capacity);
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
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenterA(centerA, this.count);
    this.setCenterB(centerB, this.count);
    this.setRadius(radius, this.count);
    this.setRotationAngle(rotationAngle, this.count);

    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    this.getCenterA(centerA, index);
    this.getCenterB(centerB, index);
    center.addVectors(centerA, centerB).multiplyScalar(0.5);
    normal.subVectors(centerA, centerB);
    const height = normal.length();
    firstRotation.setFromAxisAngle(zAxis, this.getRotationAngle(index));
    secondRotation.setFromUnitVectors(zAxis, normal.normalize());

    const diameter = 2 * this.getRadius(index);
    scale.set(diameter, diameter, height);
    return outputMatrix.compose(
      center,
      secondRotation.multiply(firstRotation),
      scale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    this.computeModelMatrix(fullMatrix, index).premultiply(matrix);
    let angle = this.getRotationAngle(index) + Math.PI / 6;

    for (let i = 0; i < 6; i++, angle += Math.PI / 3) {
      const sin = 0.5 * Math.sin(angle);
      const cos = 0.5 * Math.cos(angle);
      point.set(sin, cos, 0.5).applyMatrix4(fullMatrix);
      box.expandByPoint(point);
      point.set(sin, cos, -0.5).applyMatrix4(fullMatrix);
      box.expandByPoint(point);
    }

    return box;
  }
}
