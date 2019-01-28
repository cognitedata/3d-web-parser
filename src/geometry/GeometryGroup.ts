// Copyright 2019 Cognite AS
import * as THREE from 'three';

export default abstract class GeometryGroup {
  public type: string;
  constructor() {
    this.type = '';
  }
  abstract computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4;
  abstract computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3;

  memoryUsage() {
    let usage = 0;
    Object.keys(this).forEach(key => {
      // @ts-ignore
      if (ArrayBuffer.isView(this[key])) {
        // @ts-ignore
        usage += this[key].byteLength;
      }
    });
    return usage;
  }
}
