// Copyright 2019 Cognite AS

import SphereGroup from './SphereGroup';

export default class SphericalSegmentGroup extends SphereGroup {
  static type = 'SphericalSegment';
  public normal: Float32Array;
  public height: Float32Array;
  public isClosed: Uint8Array;
  constructor(capacity: number) {
    super(capacity);
    this.normal = new Float32Array(3 * capacity);
    this.height = new Float32Array(capacity);
    this.isClosed = new Uint8Array(capacity);
  }

  setNormal(source: THREE.Vector3, index: number) {
    this.setVector(source, this.normal, index);
  }

  getNormal(target: THREE.Vector3, index: number) {
    return this.getVector(this.normal, target, index);
  }

  setHeight(value: number, index: number) {
    this.height[index] = value;
  }

  getHeight(index: number): number {
    return this.height[index];
  }

  setIsClosed(value: boolean, index: number) {
    this.isClosed[index] = value ? 1 : 0;
  }

  getIsClosed(index: number): boolean {
    return this.isClosed[index] === 1 ? true : false;
  }

  // @ts-ignore
  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    radius: number,
    normal: THREE.Vector3,
    height: number,
    isClosed: boolean,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setRadius(radius, this.count);
    this.setNormal(normal, this.count);
    this.setHeight(height, this.count);
    this.setIsClosed(isClosed, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return box;
  }
}
