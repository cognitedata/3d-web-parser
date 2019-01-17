import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';

export default class BoxGroup extends PlaneGroup {
  static type = 'Box';
  angle: Float32Array;
  delta: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.angle = new Float32Array(capacity);
    this.delta = new Float32Array(3 * capacity);
  }

  setAngle(angle: number, index: number) {
    this.angle[index] = angle;
  }

  getAngle(index: number): number {
    return this.angle[index];
  }

  setDelta(delta: THREE.Vector3, index: number) {
    this.setVector(delta, this.delta, index);
  }

  getDelta(target: THREE.Vector3, index: number): THREE.Vector3 {
    return this.getVector(this.delta, target, index);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    angle: number,
    delta: THREE.Vector3,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setVector(center, this.center, this.count);
    this.setVector(normal, this.normal, this.count);
    this.setAngle(angle, this.count);
    this.setVector(delta, this.delta, this.count);
    this.count += 1;
  }
}
