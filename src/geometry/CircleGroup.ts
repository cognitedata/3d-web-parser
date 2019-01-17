import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';

export default class CircleGroup extends PlaneGroup {
  static type = 'Circle';
  radius: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.radius = new Float32Array(capacity);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
  ) {
    this.nodeId[this.count] = nodeId;
    this.treeIndex[this.count] = treeIndex;
    this.radius[this.count] = radius;
    this.setVector(center, this.center, this.count);
    this.setVector(normal, this.normal, this.count);
    this.setColor(color, this.count);
    this.count += 1;
  }

  setRadius(radius: number, index: number) {
    this.radius[index] = radius;
  }

  getRadius(index: number): number {
    return this.radius[index];
  }
}
