// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';
import {computeCircleBoundingBox} from './CircleGroup';
import { zAxis } from './../constants'

// reusable variables
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();
const normalMatrix = new THREE.Matrix3();
const transformedCenter = new THREE.Vector3();
const transformedNormal = new THREE.Vector3();
const reusableBox = new THREE.Box3();

const point = new THREE.Vector3();
const center = new THREE.Vector3();
const normal = new THREE.Vector3();

export default class TorusGroup extends PlaneGroup {
  static type = 'Torus';
  public radius: Float32Array;
  public tubeRadius: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.radius = new Float32Array(capacity);
    this.tubeRadius = new Float32Array(capacity);
  }

  setRadius(value: number, index: number) {
    this.radius[index] = value;
  }

  getRadius(index: number): number {
    return this.radius[index];
  }

  setTubeRadius(value: number, index: number) {
    this.tubeRadius[index] = value;
  }

  getTubeRadius(index: number): number {
    return this.tubeRadius[index];
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
    tubeRadius: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setRadius(radius, this.count);
    this.setTubeRadius(tubeRadius, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    rotation.setFromUnitVectors(zAxis, this.getNormal(normal, index));
    scale.set(1, 1, 1);

    return outputMatrix.compose(
      this.getCenter(center, index),
      rotation,
      scale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    normalMatrix.setFromMatrix4(matrix);
    const scaling = matrix.getMaxScaleOnAxis();

    transformedCenter.copy(this.getCenter(center, index)).applyMatrix4(matrix);
    transformedNormal
      .copy(this.getNormal(normal, index))
      .applyMatrix3(normalMatrix)
      .normalize();
    const radius = scaling * this.getRadius(index);
    const tubeRadius = scaling * this.getTubeRadius(index);

    const tubularSegments = 16;
    for (let i = 0; i <= tubularSegments; ++i) {
      const x = i * 2 / tubularSegments - 1;
      const y = Math.sqrt(1 - x * x);
      const sliceCenter = point
        .copy(transformedNormal)
        .multiplyScalar(x * tubeRadius)
        .add(transformedCenter);
      const sliceOuterRadius = radius + y * tubeRadius;

      box.union(
        computeCircleBoundingBox(
          sliceCenter,
          transformedNormal,
          sliceOuterRadius,
          reusableBox,
        ),
      );
    }

    return box;
  }
}
