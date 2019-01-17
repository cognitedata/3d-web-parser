import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';

export default class EllipsoidGroup extends PlaneGroup {
  static type = 'Ellipsoid';
  hRadius: Float32Array;
  vRadius: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.hRadius = new Float32Array(capacity);
    this.vRadius = new Float32Array(capacity);
  }

  setHRadius(hRadius: number, index: number) {
    this.hRadius[index] = hRadius;
  }

  getHRadius(index: number): number {
    return this.hRadius[index];
  }

  setVRadius(vRadius: number, index: number) {
    this.vRadius[index] = vRadius;
  }

  getVRadius(index: number): number {
    return this.vRadius[index];
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    hRadius: number,
    vRadius: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setVector(center, this.center, this.count);
    this.setVector(normal, this.normal, this.count);
    this.setHRadius(hRadius, this.count);
    this.setVRadius(vRadius, this.count);
    this.count += 1;
  }
}
