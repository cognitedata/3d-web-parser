import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';

export default class CircleGroup extends PlaneGroup {
  static type = 'Circle';
  radius: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.radius = new Float32Array(capacity);
  }

  setRadius(value: number, index: number) {
    this.radius[index] = value;
  }

  getRadius(index: number): number {
    return this.radius[index];
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setVector(center, this.center, this.count);
    this.setVector(normal, this.normal, this.count);
    this.setRadius(radius, this.count);
    this.count += 1;
  }
}
