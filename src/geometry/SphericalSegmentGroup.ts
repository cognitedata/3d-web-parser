// Copyright 2019 Cognite AS

import PrimitiveGroup from './PrimitiveGroup';

export default class SphericalSegmentGroup extends PrimitiveGroup {
  public center: Float32Array;
  public radius: Float32Array;
  public normal: Float32Array;
  public height: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'SphericalSegment';
    this.center = new Float32Array(3 * capacity);
    this.radius = new Float32Array(capacity);
    this.normal = new Float32Array(3 * capacity);
    this.height = new Float32Array(capacity);
  }

  setCenter(source: THREE.Vector3, index: number) {
    this.setVector(source, this.center, index);
  }

  getCenter(target: THREE.Vector3, index: number) {
    return this.getVector(this.center, target, index);
  }

  setRadius(value: number, index: number) {
    this.radius[index] = value;
  }

  getRadius(index: number): number {
    return this.radius[index];
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

  // @ts-ignore
  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
    height: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setRadius(radius, this.count);
    this.setNormal(normal, this.count);
    this.setHeight(height, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return box;
  }
}
