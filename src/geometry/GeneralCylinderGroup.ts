// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';
import { xAxis, yAxis, zAxis } from '../constants';

const globalNormal = new THREE.Vector3();
const globalVector = new THREE.Vector3();
const globalPlane = new THREE.Vector4();
const globalRotation = new THREE.Quaternion();
const globalSlicingPlaneNormal = new THREE.Vector3();

export default class GeneralCylinderGroup extends BaseCylinderGroup {

  static slicingPlane(target: THREE.Vector4,
                      slope: number,
                      zAngle: number,
                      height: number,
                      invertNormal: boolean): THREE.Vector4 {
    globalSlicingPlaneNormal
      .copy(zAxis)
      .applyAxisAngle(yAxis, slope)
      .applyAxisAngle(zAxis, zAngle);

    if (invertNormal) {
      globalSlicingPlaneNormal.negate();
    }

    return target.set(
      globalSlicingPlaneNormal.x,
      globalSlicingPlaneNormal.y,
      globalSlicingPlaneNormal.z,
      height,
    );
  }
    public angle: Float32Array;
    public arcAngle: Float32Array;
    public radius: Float32Array;
    public heightA: Float32Array;
    public heightB: Float32Array;
    public slopeA: Float32Array;
    public slopeB: Float32Array;
    public zAngleA: Float32Array;
    public zAngleB: Float32Array;
    public planeA: Float32Array;
    public planeB: Float32Array;
    public localXAxis: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'GeneralCylinder';
    this.angle = new Float32Array(capacity);
    this.arcAngle = new Float32Array(capacity);
    this.radius = new Float32Array(capacity);
    this.heightA = new Float32Array(capacity);
    this.heightB = new Float32Array(capacity);
    this.slopeA = new Float32Array(capacity);
    this.slopeB = new Float32Array(capacity);
    this.zAngleA = new Float32Array(capacity);
    this.zAngleB = new Float32Array(capacity);
    this.planeA = new Float32Array(4 * capacity);
    this.planeB = new Float32Array(4 * capacity);
    this.localXAxis = new Float32Array(3 * capacity);
    this.hasCustomTransformAttributes = true;

    this.attributes.push({
      name: 'a_planeA',
      array: this.planeA,
      itemSize: 4,
    });

    this.attributes.push({
      name: 'a_planeB',
      array: this.planeB,
      itemSize: 4,
    });

    this.attributes.push({
      name: 'a_centerA',
      array: this.centerA,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'a_centerB',
      array: this.centerB,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'a_localXAxis',
      array: this.localXAxis,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'a_radiusA',
      array: this.radius,
      itemSize: 1,
    });

    this.attributes.push({
      name: 'a_angle',
      array: this.angle,
      itemSize: 1,
    });

    this.attributes.push({
      name: 'a_arcAngle',
      array: this.arcAngle,
      itemSize: 1,
    });
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

  setRadius(value: number, index: number) {
    this.radius[index] = value;
  }

  getRadius(index: number): number {
    return this.radius[index];
  }

  setHeightA(value: number, index: number) {
    this.heightA[index] = value;
  }

  getHeightA(index: number): number {
    return this.heightA[index];
  }

  setHeightB(value: number, index: number) {
    this.heightB[index] = value;
  }

  getHeightB(index: number): number {
    return this.heightB[index];
  }

  setSlopeA(value: number, index: number) {
    this.slopeA[index] = value;
  }

  getSlopeA(index: number): number {
    return this.slopeA[index];
  }

  setSlopeB(value: number, index: number) {
    this.slopeB[index] = value;
  }

  getSlopeB(index: number): number {
    return this.slopeB[index];
  }

  setZAngleA(value: number, index: number) {
    this.zAngleA[index] = value;
  }

  getZAngleA(index: number): number {
    return this.zAngleA[index];
  }

  setZAngleB(value: number, index: number) {
    this.zAngleB[index] = value;
  }

  getZAngleB(index: number): number {
    return this.zAngleB[index];
  }

  setPlaneA(value: THREE.Vector4, index: number) {
    this.setVector(value, this.planeA, index);
  }

  getPlaneA(target: THREE.Vector4, index: number): THREE.Vector4 {
    return this.getVector(this.planeA, target, index);
  }

  setPlaneB(value: THREE.Vector4, index: number) {
    this.setVector(value, this.planeB, index);
  }

  getPlaneB(target: THREE.Vector4, index: number): THREE.Vector4 {
    return this.getVector(this.planeB, target, index);
  }

  setLocalXAxis(value: THREE.Vector3, index: number) {
    this.setVector(value, this.localXAxis, index);
  }

  getLocalXAxis(target: THREE.Vector3, index: number): THREE.Vector3 {
    return this.getVector(this.localXAxis, target, index);
  }

  // TODO(anders.hafreager) TS is angry since add already exists with
  // different signature in parent class.
  // @ts-ignore
  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radius: number,
    heightA: number,
    heightB: number,
    slopeA: number,
    slopeB: number,
    zAngleA: number,
    zAngleB: number,
    angle: number = 0,
    arcAngle: number = Math.PI * 2.0,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenterA(centerA, this.count);
    this.setCenterB(centerB, this.count);
    this.setRadius(radius, this.count);
    this.setHeightA(heightA, this.count);
    this.setHeightB(heightB, this.count);
    this.setSlopeA(slopeA, this.count);
    this.setSlopeB(slopeB, this.count);
    this.setZAngleA(zAngleA, this.count);
    this.setZAngleB(zAngleB, this.count);
    this.setAngle(angle, this.count);
    this.setArcAngle(arcAngle, this.count);
    this.setPlaneA(
      GeneralCylinderGroup.slicingPlane(
        globalPlane,
        this.getSlopeA(this.count),
        this.getZAngleA(this.count),
        this.getHeightA(this.count),
        false),
      this.count);
    this.setPlaneB(
      GeneralCylinderGroup.slicingPlane(
        globalPlane,
        this.getSlopeB(this.count),
        this.getZAngleB(this.count),
        this.getHeightB(this.count),
        true),
      this.count);

    globalNormal.subVectors(centerA, centerB).normalize();
    globalRotation.setFromUnitVectors(zAxis, globalNormal);
    this.setLocalXAxis(globalVector.copy(xAxis).applyQuaternion(globalRotation), this.count);

    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    console.log('TODO: implement computeBoundingBox for general cylinder');
    return box;
  }
}
