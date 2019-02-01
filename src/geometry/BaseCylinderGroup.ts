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
