import * as THREE from 'three';
import BaseCylinderGroup from './BaseCylinderGroup';

export default class CylinderGroup extends BaseCylinderGroup {
    static type = 'Cylinder';
    radius: Float32Array;
    isClosed: Uint8Array;
  constructor(capacity: number) {
    super(capacity);
    this.radius = new Float32Array(capacity);
    this.isClosed = new Uint8Array(capacity);
  }

  setRadius(value: number, index: number) {
    this.radius[index] = value;
  }

  getRadius(index: number): number {
    return this.radius[index];
  }

  setIsClosed(value: boolean, index: number) {
    this.isClosed[index] = value ? 1 : 0;
  }

  getIsClosed(index: number): boolean {
    return this.isClosed[index] === 1 ? true : false;
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radius: number,
    isClosed: boolean,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setVector(centerA, this.centerA, this.count);
    this.setVector(centerB, this.centerB, this.count);
    this.setRadius(radius, this.count);
    this.setIsClosed(isClosed, this.count);

    this.count += 1;
  }
}
