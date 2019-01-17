import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';

export default class NutGroup extends BaseCylinderGroup {
    static type = 'Nut';
    radius: Float32Array;
    rotationAngle: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.radius = new Float32Array(capacity);
    this.rotationAngle = new Float32Array(capacity);
  }

  setRadius(value: number, index: number) {
    this.radius[index] = value;
  }

  getRadius(index: number): number {
    return this.radius[index];
  }

  setRotationAngle(value: number, index: number) {
    this.rotationAngle[index] = value;
  }

  getRotationAngle(index: number): number {
    return this.rotationAngle[index];
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radius: number,
    rotationAngle: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setVector(centerA, this.centerA, this.count);
    this.setVector(centerB, this.centerB, this.count);
    this.setRadius(radius, this.count);
    this.setRotationAngle(rotationAngle, this.count);

    this.count += 1;
  }
}
