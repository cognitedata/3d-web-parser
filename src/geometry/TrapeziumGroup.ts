// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { FilterOptions } from '../parsers/parseUtils';
import { RenderedPrimitiveNameType } from './Types';
import PrimitiveGroupData from './PrimitiveGroupData';

// reusable variables
const point = new THREE.Vector3();
const vertex = new THREE.Vector3();

export default class TrapeziumGroup extends PrimitiveGroup {
  public type: RenderedPrimitiveNameType;
  public data: PrimitiveGroupData;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'Trapezium';
    this.hasCustomTransformAttributes = true;
    this.data = new PrimitiveGroupData('Trapezium', capacity);
  }

  add(
    nodeId: number,
    treeIndex: number,
    size: number,
    vertex1: THREE.Vector3,
    vertex2: THREE.Vector3,
    vertex3: THREE.Vector3,
    vertex4: THREE.Vector3,
    filterOptions?: FilterOptions
  ): boolean {
    this.setTreeIndex(treeIndex, this.data.count);
    this.data.add({
      size,
      vertex1,
      vertex2,
      vertex3,
      vertex4
    });

    return this.filterLastObject(nodeId, filterOptions);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    box.expandByPoint(this.data.getVector3('vertex1', vertex, index).applyMatrix4(matrix));
    box.expandByPoint(this.data.getVector3('vertex2', vertex, index).applyMatrix4(matrix));
    box.expandByPoint(this.data.getVector3('vertex3', vertex, index).applyMatrix4(matrix));
    box.expandByPoint(this.data.getVector3('vertex4', vertex, index).applyMatrix4(matrix));
    return box;
  }
}
