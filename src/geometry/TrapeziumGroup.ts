// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { FilterOptions } from '../parsers/parseUtils';

// reusable variables
const point = new THREE.Vector3();
const vertex = new THREE.Vector3();

export default class TrapeziumGroup extends PrimitiveGroup {
  public vertex1: Float32Array;
  public vertex2: Float32Array;
  public vertex3: Float32Array;
  public vertex4: Float32Array;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'Trapezium';
    this.vertex1 = new Float32Array(3 * capacity);
    this.vertex2 = new Float32Array(3 * capacity);
    this.vertex3 = new Float32Array(3 * capacity);
    this.vertex4 = new Float32Array(3 * capacity);
    this.hasCustomTransformAttributes = true;

    this.attributes.push({
      name: 'aVertex1',
      array: this.vertex1,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'aVertex2',
      array: this.vertex2,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'aVertex3',
      array: this.vertex3,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'aVertex4',
      array: this.vertex4,
      itemSize: 3,
    });
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

  setVertex4(value: THREE.Vector3, index: number) {
    this.setVector(value, this.vertex4, index);
  }

  getVertex4(target: THREE.Vector3, index: number) {
    return this.getVector(this.vertex4, target, index);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    vertex1: THREE.Vector3,
    vertex2: THREE.Vector3,
    vertex3: THREE.Vector3,
    vertex4: THREE.Vector3,
    filterOptions?: FilterOptions,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setVertex1(vertex1, this.count);
    this.setVertex2(vertex2, this.count);
    this.setVertex3(vertex3, this.count);
    this.setVertex4(vertex4, this.count);

    this.count += 1;

    if (filterOptions) {
      this.filterLastObject(filterOptions);
    }
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    box.expandByPoint(this.getVertex1(vertex, index));
    box.expandByPoint(this.getVertex2(vertex, index));
    box.expandByPoint(this.getVertex3(vertex, index));
    box.expandByPoint(this.getVertex4(vertex, index));
    return box;
  }
}
