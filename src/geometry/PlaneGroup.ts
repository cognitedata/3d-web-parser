// Copyright 2019 Cognite AS

import PrimitiveGroup from './PrimitiveGroup';

export default class PlaneGroup extends PrimitiveGroup {
  public center: Float32Array;
  public normal: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.center = new Float32Array(3 * capacity);
    this.normal = new Float32Array(3 * capacity);
  }

  setCenter(source: THREE.Vector3, index: number) {
    this.setVector(source, this.center, index);
  }

  getCenter(target: THREE.Vector3, index: number) {
    return this.getVector(this.center, target, index);
  }

  setNormal(source: THREE.Vector3, index: number) {
    this.setVector(source, this.normal, index);
  }

  getNormal(target: THREE.Vector3, index: number) {
    return this.getVector(this.normal, target, index);
  }
}
