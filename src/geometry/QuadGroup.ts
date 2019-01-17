// Copyright 2019 Cognite AS

import PrimitiveGroup from './PrimitiveGroup';

export default class QuadGroup extends PrimitiveGroup {
  static type = 'Quad';
  public vertex1: Float32Array;
  public vertex2: Float32Array;
  public vertex3: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.vertex1 = new Float32Array(3 * capacity);
    this.vertex2 = new Float32Array(3 * capacity);
    this.vertex3 = new Float32Array(3 * capacity);
  }

  setVertex1(value: THREE.Vector3, index: number) {
    this.setVector(value, this.vertex1, index);
  }

  getVertex1(target: THREE.Vector3, index: number) {
    return this.getVector(this.vertex1, target, index);
  }

  setVertex2(value: THREE.Vector3, index: number) {
    this.setVector(value, this.vertex2, index);
  }

  getVertex2(target: THREE.Vector3, index: number) {
    return this.getVector(this.vertex2, target, index);
  }

  setVertex3(value: THREE.Vector3, index: number) {
    this.setVector(value, this.vertex3, index);
  }

  getVertex3(target: THREE.Vector3, index: number) {
    return this.getVector(this.vertex3, target, index);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    vertex1: THREE.Vector3,
    vertex2: THREE.Vector3,
    vertex3: THREE.Vector3,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setVertex1(vertex1, this.count);
    this.setVertex2(vertex2, this.count);
    this.setVertex3(vertex3, this.count);

    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 { }
  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 { }
}
