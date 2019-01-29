// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';

// reusable variables
const basis = new THREE.Matrix4();
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();

const center = new THREE.Vector3();
const normal = new THREE.Vector3();
const side1 = new THREE.Vector3();
const side2 = new THREE.Vector3();
const vertex1 = new THREE.Vector3();
const vertex2 = new THREE.Vector3();
const vertex3 = new THREE.Vector3();
const vertex4 = new THREE.Vector3();
const point = new THREE.Vector3();

export default class QuadGroup extends PrimitiveGroup {
  public vertex1: Float32Array;
  public vertex2: Float32Array;
  public vertex3: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'Quad';
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

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    this.getVertex1(vertex1, index);
    this.getVertex2(vertex2, index);
    this.getVertex3(vertex3, index);

    side1.subVectors(vertex3, vertex1);
    side2.subVectors(vertex3, vertex2);
    scale.set(side2.length(), side1.length(), 1);
    normal.crossVectors(side1, side2).normalize();
    side1.normalize();
    side2.normalize();

    basis.set(
      side2.x, side1.x, normal.x, 0,
      side2.y, side1.y, normal.y, 0,
      side2.z, side1.z, normal.z, 0,
            0,       0,        0, 1,
    );

    outputMatrix = outputMatrix.identity().compose(
      center.set(0, 0, 0),
      rotation,
      scale,
    );

    outputMatrix.premultiply(basis);

    center.addVectors(vertex1, vertex2).multiplyScalar(0.5);
    basis.set(
      1, 0, 0, center.x,
      0, 1, 0, center.y,
      0, 0, 1, center.z,
      0, 0, 0, 1,
    );

    outputMatrix.premultiply(basis);

    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    this.getVertex1(vertex1, index);
    this.getVertex2(vertex2, index);
    this.getVertex3(vertex3, index);

    box.makeEmpty();
    vertex4.subVectors(vertex1, vertex3).add(vertex2);
    const vertices = [vertex1, vertex2, vertex3, vertex4];
    vertices.forEach(vertex => {
      box.expandByPoint(point.copy(vertex).applyMatrix4(matrix));
    });

    return box;
  }
}
