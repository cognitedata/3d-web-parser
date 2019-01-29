// Copyright 2019 Cognite AS

import * as THREE from 'three';
import TorusGroup from './TorusGroup';
import { computeCircleBoundingBox } from './CircleGroup';
import { zAxis, twoPI } from './../constants';

// reusable variables
const firstRotation = new THREE.Quaternion();
const secondRotation = new THREE.Quaternion();
const scale = new THREE.Vector3();
const tubeCenter = new THREE.Vector3();
const tubeNormal = new THREE.Vector3();
const reusableBox = new THREE.Box3();
const normalMatrix = new THREE.Matrix3();

const normal = new THREE.Vector3();
const center = new THREE.Vector3();

export default class TorusSegmentGroup extends TorusGroup {
  static type = 'TorusSegment';
  public angle: Float32Array;
  public arcAngle: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.radius = new Float32Array(capacity);
    this.tubeRadius = new Float32Array(capacity);
    this.angle = new Float32Array(capacity);
    this.arcAngle = new Float32Array(capacity);
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

  // @ts-ignore
  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
    tubeRadius: number,
    angle: number,
    arcAngle: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setRadius(radius, this.count);
    this.setTubeRadius(tubeRadius, this.count);
    this.setAngle(angle, this.count);
    this.setArcAngle(arcAngle, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    firstRotation.setFromAxisAngle(zAxis, this.getAngle(index));
    secondRotation.setFromUnitVectors(zAxis, this.getNormal(normal, index));
    scale.set(1, 1, 1);

    return outputMatrix.compose(
      this.getCenter(center, index),
      secondRotation.multiply(firstRotation), // A.multiply(B) === A*B
      scale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();

    normalMatrix.setFromMatrix4(matrix);
    secondRotation.setFromUnitVectors(zAxis, this.getNormal(normal, index));

    const radialSegmentAngle = twoPI / 24;
    const angle = this.getAngle(index);
    const arcAngle = this.getArcAngle(index);
    const radius = this.getRadius(index);

    const iterations = Math.ceil(arcAngle / radialSegmentAngle) + 1;
    for (let i = 0; i < iterations; ++i) {
      const zAngle = Math.min(angle + i * radialSegmentAngle, angle + arcAngle);
      const x = Math.cos(zAngle);
      const y = Math.sin(zAngle);
      tubeCenter
        .set(x * radius, y * radius, 0)
        .applyQuaternion(secondRotation)
        .add(this.getCenter(center, index))
        .applyMatrix4(matrix);
      tubeNormal
        .set(y, -x, 0)
        .applyQuaternion(secondRotation)
        .applyMatrix3(normalMatrix);
      box.union(
        computeCircleBoundingBox(
          tubeCenter,
          tubeNormal,
          this.getTubeRadius(index),
          reusableBox,
        ),
      );
    }

    return box;
  }
}
