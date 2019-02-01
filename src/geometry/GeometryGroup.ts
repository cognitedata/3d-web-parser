// Copyright 2019 Cognite AS
import * as THREE from 'three';

export default abstract class GeometryGroup {
  public type: string;
  constructor() {
    this.type = '';
  }
  abstract computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4;
  abstract computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3;

  memoryUsage(usage: any) {
    Object.keys(this).forEach(key => {
      // @ts-ignore
      if (ArrayBuffer.isView(this[key])) {
        if (usage.byProperty[key] == null) {
          usage.byProperty[key] = 0;
        }
        if (usage.byGeometry[this.type] == null) {
          usage.byGeometry[this.type] = 0;
        }
        // @ts-ignore
        usage.byGeometry[this.type] += this[key].byteLength;
        // @ts-ignore
        usage.byProperty[key] += this[key].byteLength;
        // @ts-ignore
        usage.total += this[key].byteLength;
      }
    });
    return usage;
  }
}
