// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { FilterOptions } from '../parsers/parseUtils';
import GeometryGroupData from './GeometryGroupData';

// reusable variables
const point = new THREE.Vector3();
const vertex = new THREE.Vector3();

export default class TrapeziumGroup extends PrimitiveGroup {

  public data: GeometryGroupData;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'Trapezium';
    this.hasCustomTransformAttributes = true;
    this.data = new GeometryGroupData('Trapezium', capacity);
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
    this.setNodeId(nodeId, this.data.count);
    this.setTreeIndex(treeIndex, this.data.count);
    this.setColor(color, this.data.count);
    this.data.add({
      nodeId: nodeId,
      treeIndex: treeIndex,
      color: color,
      vertex1: vertex1,
      vertex2: vertex2,
      vertex3: vertex3,
      vertex4: vertex4,
    });

    if (filterOptions) {
      this.filterLastObject(filterOptions);
    }
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
