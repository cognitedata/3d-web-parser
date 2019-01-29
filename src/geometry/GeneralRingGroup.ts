// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';
import { computeEllipsoidBoundingBox } from './EllipsoidSegmentGroup';

// reusable variables
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();
const rotationMatrix = new THREE.Matrix4();
const localYAxis = new THREE.Vector3();

const normal = new THREE.Vector3();
const localXAxis = new THREE.Vector3();
const center = new THREE.Vector3();

export default class GeneralRingGroup extends PlaneGroup {
  static type = 'GeneralRing';
  public xRadius: Float32Array;
  public yRadius: Float32Array;
  public localXAxis: Float32Array;
  public thickness: Float32Array;
  public angle: Float32Array;
  public arcAngle: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.xRadius = new Float32Array(capacity);
    this.yRadius = new Float32Array(capacity);
    this.localXAxis = new Float32Array(3 * capacity);
    this.thickness = new Float32Array(capacity);
    this.angle = new Float32Array(capacity);
    this.arcAngle = new Float32Array(capacity);
  }

  setXRadius(value: number, index: number) {
    this.xRadius[index] = value;
  }

  getXRadius(index: number): number {
    return this.xRadius[index];
  }

  setYRadius(value: number, index: number) {
    this.yRadius[index] = value;
  }

  getYRadius(index: number): number {
    return this.yRadius[index];
  }

  setLocalXAxis(value: THREE.Vector3, index: number) {
    this.setVector(value, this.localXAxis, index);
  }

  getLocalXAxis(target: THREE.Vector3, index: number): THREE.Vector3 {
    return this.getVector(this.localXAxis, target, index);
  }

  setThickness(value: number, index: number) {
    this.thickness[index] = value;
  }

  getThickness(index: number): number {
    return this.thickness[index];
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
    center: THREE.Vector3,
    normal: THREE.Vector3,
    localXAxis: THREE.Vector3,
    xRadius: number,
    yRadius: number,
    thickness: number,
    angle: number = 0,
    arcAngle: number = 2 * Math.PI,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setXRadius(xRadius, this.count);
    this.setYRadius(yRadius, this.count);
    this.setLocalXAxis(localXAxis, this.count);
    this.setThickness(thickness, this.count);
    this.setAngle(angle, this.count);
    this.setArcAngle(arcAngle, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    this.getNormal(normal, index);
    this.getLocalXAxis(localXAxis, index);
    localYAxis.crossVectors(this.getNormal(normal, index), this.getLocalXAxis(localXAxis, index));
    rotationMatrix.set(
      localXAxis.x, localYAxis.x, normal.x, 0,
      localXAxis.y, localYAxis.y, normal.y, 0,
      localXAxis.z, localYAxis.z, normal.z, 0,
                 0,            0,        0, 1,
    );

    rotation.setFromRotationMatrix(rotationMatrix);
    scale.set(2 * this.getXRadius(index), 2 * this.getYRadius(index), 1);
    return outputMatrix.compose(
      this.getCenter(center, index),
      rotation,
      scale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return computeEllipsoidBoundingBox(
      this.getCenter(center, index),
      this.getNormal(normal, index),
      this.getXRadius(index),
      this.getYRadius(index),
      0,
      matrix,
      box,
    );
  }
}
