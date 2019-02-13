// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { FilterOptions } from '../parsers/parseUtils';
import GeometryGroupData from './GeometryGroupData';

// reusable variables
const basis = new THREE.Matrix4();
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();

const center = new THREE.Vector3();
const normal = new THREE.Vector3();
const side1 = new THREE.Vector3();
const side2 = new THREE.Vector3();
const globalVertex1 = new THREE.Vector3();
const globalVertex2 = new THREE.Vector3();
const globalVertex3 = new THREE.Vector3();
const globalVertex4 = new THREE.Vector3();
const point = new THREE.Vector3();

export default class QuadGroup extends PrimitiveGroup {
  public data: GeometryGroupData;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'Quad';
    this.data = new GeometryGroupData('Quad', capacity, this.attributes);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    vertex1: THREE.Vector3,
    vertex2: THREE.Vector3,
    vertex3: THREE.Vector3,
    filterOptions?: FilterOptions,
  ) {
    this.setNodeId(nodeId, this.data.count);
    this.setTreeIndex(treeIndex, this.data.count);
    this.setColor(color, this.data.count);
    this.data.add({
      vertex1,
      vertex2,
      vertex3,
    });

    if (filterOptions) {
      this.filterLastObject(filterOptions);
    }
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    this.data.getVector3('vertex1', globalVertex1, index);
    this.data.getVector3('vertex2', globalVertex2, index);
    this.data.getVector3('vertex3', globalVertex3, index);

    side1.subVectors(globalVertex3, globalVertex1);
    side2.subVectors(globalVertex3, globalVertex2);
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

    center.addVectors(globalVertex1, globalVertex2).multiplyScalar(0.5);
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
    this.data.getVector3('vertex1', globalVertex1, index);
    this.data.getVector3('vertex2', globalVertex2, index);
    this.data.getVector3('vertex3', globalVertex3, index);

    box.makeEmpty();
    globalVertex4.subVectors(globalVertex1, globalVertex3).add(globalVertex2);
    const vertices = [globalVertex1, globalVertex2, globalVertex3, globalVertex4];
    vertices.forEach(vertex => {
      box.expandByPoint(point.copy(vertex).applyMatrix4(matrix));
    });

    return box;
  }
}
