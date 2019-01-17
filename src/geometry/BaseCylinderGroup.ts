// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';

export default abstract class BaseCylinderGroup extends PrimitiveGroup {
  centerA: Float32Array;
  centerB: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.centerA = new Float32Array(3 * capacity);
    this.centerB = new Float32Array(3 * capacity);
  }

  setCenterA(value: THREE.Vector3, index: number) {
    this.setVector(value, this.centerA, index);
  }

  getCenterA(target: THREE.Vector3, index: number): THREE.Vector3 {
    return this.getVector(this.centerA, target, index);
  }

  setCenterB(value: THREE.Vector3, index: number) {
    this.setVector(value, this.centerB, index);
  }

  getCenterB(target: THREE.Vector3, index: number): THREE.Vector3 {
    return this.getVector(this.centerB, target, index);
  }
}
