// Copyright 2019 Cognite AS

import PrimitiveGroup from './PrimitiveGroup';

export default class SphereGroup extends PrimitiveGroup {
  static type = 'Sphere';
  public center: Float32Array;
  public radius: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.center = new Float32Array(3 * capacity);
    this.radius = new Float32Array(capacity);
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

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    radius: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setRadius(radius, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 { }
  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 { }
}
