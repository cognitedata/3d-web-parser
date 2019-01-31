// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';
import { computeEllipsoidBoundingBox } from './EllipsoidSegmentGroup';

// reusable variables
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();
const rotationMatrix = new THREE.Matrix4();
const localYAxis = new THREE.Vector3();

const globalNormal = new THREE.Vector3();
const globalLocalXAxis = new THREE.Vector3();
const globalCenter = new THREE.Vector3();

export default class GeneralRingGroup extends PlaneGroup {
  public xRadius: Float32Array;
  public yRadius: Float32Array;
  public localXAxis: Float32Array;
  public thickness: Float32Array;
  public angle: Float32Array;
  public arcAngle: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'GeneralRing';
    this.xRadius = new Float32Array(capacity);
    this.yRadius = new Float32Array(capacity);
    this.localXAxis = new Float32Array(3 * capacity);
    this.thickness = new Float32Array(capacity);
    this.angle = new Float32Array(capacity);
    this.arcAngle = new Float32Array(capacity);
    this.hasCustomTransformAttributes = true;

    this.attributes.push({
      name: 'a_thickness',
      array: this.thickness,
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
    this.setThickness(thickness / yRadius, this.count);
    this.setAngle(angle, this.count);
    this.setArcAngle(arcAngle, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    this.getNormal(globalNormal, index);
    this.getLocalXAxis(globalLocalXAxis, index);
    localYAxis.crossVectors(this.getNormal(globalNormal, index), this.getLocalXAxis(globalLocalXAxis, index));
    rotationMatrix.set(
      globalLocalXAxis.x, localYAxis.x, globalNormal.x, 0,
      globalLocalXAxis.y, localYAxis.y, globalNormal.y, 0,
      globalLocalXAxis.z, localYAxis.z, globalNormal.z, 0,
                 0,            0,        0, 1,
    );

    rotation.setFromRotationMatrix(rotationMatrix);
    scale.set(2 * this.getXRadius(index), 2 * this.getYRadius(index), 1);
    return outputMatrix.compose(
      this.getCenter(globalCenter, index),
      rotation,
      scale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return computeEllipsoidBoundingBox(
      this.getCenter(globalCenter, index),
      this.getNormal(globalNormal, index),
      this.getXRadius(index),
      this.getYRadius(index),
      0,
      matrix,
      box,
    );
  }
}
