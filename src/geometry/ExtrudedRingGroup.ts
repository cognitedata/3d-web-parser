// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';
import { zAxis, twoPI, identityMatrix4 } from './../constants';
import { computeCircleBoundingBox } from './CircleGroup';

// reusable variables
const firstRotation = new THREE.Quaternion();
const secondRotation = new THREE.Quaternion();
const scale = new THREE.Vector3();

const normalMatrix = new THREE.Matrix3();
const reusableBox = new THREE.Box3();

const globalCenter = new THREE.Vector3();
const globalNormal = new THREE.Vector3();
const globalPoint = new THREE.Vector3();
const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();

export default class ExtrudedRingGroup extends BaseCylinderGroup {
    public innerRadius: Float32Array;
    public outerRadius: Float32Array;
    public angle: Float32Array;
    public arcAngle: Float32Array;
    public isClosed: Uint8Array;

    constructor(capacity: number) {
    super(capacity);
    this.type = 'ExtrudedRing';
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
    this.getCenterA(globalCenterA, index);
    this.getCenterB(globalCenterB, index);
    globalCenter.addVectors(globalCenterA, globalCenterB).multiplyScalar(0.5);
    globalNormal.subVectors(globalCenterA, globalCenterB);
    const height = globalNormal.length() / 2;
    globalNormal.normalize();

    firstRotation.setFromAxisAngle(zAxis, this.getAngle(index));
    secondRotation.setFromUnitVectors(zAxis, globalNormal);

    scale.set(1, 1, height);

    return outputMatrix.compose(
      globalCenter,
      secondRotation.multiply(firstRotation), // A.multiply(B) === A*B
      scale,
    );
  }

  computeExtrudedRingBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    this.getCenterA(globalCenterA, index);
    this.getCenterB(globalCenterB, index);

    normalMatrix.setFromMatrix4(matrix);
    const scaling = matrix.getMaxScaleOnAxis();

    globalNormal
      .subVectors(globalCenterA, globalCenterB)
      .applyMatrix3(normalMatrix)
      .normalize();
    const maxRadius = scaling * this.getOuterRadius(index);

    [globalCenterA, globalCenterB].forEach(capCenter => {
      globalCenter.copy(capCenter).applyMatrix4(matrix);
      box.union(
        computeCircleBoundingBox(globalCenter, globalNormal, maxRadius, reusableBox),
      );
    });

    return box;
  }

  computeExtrudedRingSegmentBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    const radialSegmentAngle = twoPI / 24;
    this.getCenterA(globalCenterA, index);
    this.getCenterB(globalCenterB, index);
    const arcAngle = this.getArcAngle(index);
    const angle = this.getAngle(index);
    const iterations = Math.ceil(arcAngle / radialSegmentAngle) + 1;
    secondRotation.setFromUnitVectors(zAxis, globalNormal.subVectors(globalCenterA, globalCenterB).normalize());
    for (let i = 0; i < iterations; ++i) {
      [this.getOuterRadius(index), this.getInnerRadius(index)].forEach(circleRadius => {
        [globalCenterA, globalCenterB].forEach(circleCenter => {
          const zAngle = Math.min(angle + i * radialSegmentAngle, angle + arcAngle);
          const x = Math.cos(zAngle) * circleRadius;
          const y = Math.sin(zAngle) * circleRadius;
          globalPoint
            .set(x, y, 0)
            .applyQuaternion(secondRotation)
            .add(circleCenter)
            .applyMatrix4(matrix);
          box.expandByPoint(globalPoint);
        });
      });
    }

    return box;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();

    return this.getArcAngle(index) < twoPI ?
      this.computeExtrudedRingSegmentBoundingBox(matrix, box, index) :
      this.computeExtrudedRingBoundingBox(matrix, box, index);
  }
}
