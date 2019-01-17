import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';

export default class BoxGroup extends PlaneGroup {
  static type = 'Box';
  public angle: Float32Array;
  public delta: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.angle = new Float32Array(capacity);
    this.delta = new Float32Array(3 * capacity);
  }

  setAngle(value: number, index: number) {
    this.angle[index] = value;
  }

  getAngle(index: number): number {
    return this.angle[index];
  }

  setDelta(value: THREE.Vector3, index: number) {
    this.setVector(value, this.delta, index);
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
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setAngle(angle, this.count);
    this.setDelta(delta, this.count);
    this.count += 1;
  }
}
