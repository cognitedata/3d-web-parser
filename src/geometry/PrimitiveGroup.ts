// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeometryGroup from './GeometryGroup';

import BoxGroup from './BoxGroup';
import CircleGroup from './CircleGroup';
import ConeGroup from './ConeGroup';
import EccentricConeGroup from './EccentricConeGroup';
import EllipsoidSegmentGroup from './EllipsoidSegmentGroup';
import GeneralCylinderGroup from './GeneralCylinderGroup';
import GeneralRingGroup from './GeneralRingGroup';
import NutGroup from './NutGroup';
import QuadGroup from './QuadGroup';
import SphericalSegmentGroup from './SphericalSegmentGroup';
import TorusSegmentGroup from './TorusSegmentGroup';
import TrapeziumGroup from './TrapeziumGroup';
import { FilterOptions } from '../parsers/parseUtils';
import { identityMatrix4 } from '../constants';
import PrimitiveGroupData from './PrimitiveGroupData';
import { RenderedPrimitiveNameType } from './Types';
import { primitiveAttributes, getAttributeItemSize } from './PrimitiveGroupDataParameters';

const matrix = new THREE.Matrix4();
const globalBox = new THREE.Box3();

type TypedArray = Float32Array | Float64Array;
type THREEVector = THREE.Vector2 | THREE.Vector3 | THREE.Vector4;

export interface Attribute {
  name: string;
  array: TypedArray;
  itemSize: number;
}

interface TreeIndexMap {
  [s: number]: number[];
}

export default abstract class PrimitiveGroup extends GeometryGroup {
  public abstract type: RenderedPrimitiveNameType;
  public capacity: number;
  public treeIndex: Float32Array;
  public treeIndexMap: TreeIndexMap;
  public abstract data: PrimitiveGroupData;
  public sorted: boolean;

  // The transformX arrays contain contain transformation matrix
  public transform0: Float32Array;
  public transform1: Float32Array;
  public transform2: Float32Array;
  public transform3: Float32Array;
  public hasCustomTransformAttributes: boolean;
  public attributes: Attribute[];
  constructor(capacity: number) {
    super();
    this.capacity = capacity;
    this.treeIndexMap = {};

    this.treeIndex = new Float32Array(this.capacity);
    this.transform0 = new Float32Array(0);
    this.transform1 = new Float32Array(0);
    this.transform2 = new Float32Array(0);
    this.transform3 = new Float32Array(0);
    this.attributes = [];
    this.hasCustomTransformAttributes = false;
    this.sorted = false;
  }

  abstract computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4;
  abstract computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3;

  setupAttributes() {
    this.attributes.push({ name: 'treeIndex', array: this.treeIndex, itemSize: 1 });
    primitiveAttributes[this.type].forEach(property => {
      this.attributes.push({
        name: 'a_' + property,
        array: this.data.arrays[property],
        itemSize: getAttributeItemSize(property)
      });

      if (this.data.arrays[property] === undefined) {
        throw Error('Primitive attributes issue. Property: ' + property + ', type: ' + this.type);
      }
    });
  }

  filterLastObject(nodeId: number, filterOptions?: FilterOptions) {
    if (!filterOptions) {
      return true; // Did add this geometry
    }
    const index = this.data.count - 1;
    this.computeBoundingBox(identityMatrix4, globalBox, index);
    const boundingBoxFilterResult =
      filterOptions.boundingBoxFilter && !filterOptions.boundingBoxFilter.intersectsBox(globalBox);
    const nodeIdFilterResult = filterOptions.nodeIdFilter && filterOptions.nodeIdFilter.indexOf(nodeId) === -1;
    const sizeFilterResult =
      filterOptions.sizeThreshold && globalBox.max.distanceTo(globalBox.min) < filterOptions.sizeThreshold;
    if (boundingBoxFilterResult || nodeIdFilterResult || sizeFilterResult) {
      // Reduce count, i.e. remove last geometry
      this.data.count -= 1;
      return false; // Did not add this geometry
    }
    return true; // Did add this geometry
  }

  setTreeIndex(value: number, index: number) {
    this.treeIndex[index] = value;
  }

  buildTreeIndexMap() {
    this.treeIndexMap = {};
    for (let i = 0; i < this.data.count; i++) {
      const treeIndex = this.treeIndex[i];
      if (this.treeIndexMap[treeIndex] === undefined) {
        this.treeIndexMap[treeIndex] = [i];
      } else {
        this.treeIndexMap[treeIndex].push(i);
      }
    }
  }

  getTreeIndex(index: number): number {
    return this.treeIndex[index];
  }

  computeTransformAttributes() {
    if (!this.sorted) {
      throw Error('Computing transform attributes before sorting geometries by size');
    }
    if (this.hasCustomTransformAttributes) {
      return;
    }

    // the 3x4 matrix to the shader.
    // This array has length 4 (four columns in the matrix)
    // and will contain block of 3 numbers (one block per object)
    this.transform0 = new Float32Array(3 * this.data.count);
    this.transform1 = new Float32Array(3 * this.data.count);
    this.transform2 = new Float32Array(3 * this.data.count);
    this.transform3 = new Float32Array(3 * this.data.count);

    let rowIndex = 0;

    for (let i = 0; i < this.data.count; i++) {
      this.computeModelMatrix(matrix, i);
      for (let row = 0; row < 3; row++) {
        let idx = row;
        this.transform0[rowIndex] = matrix.elements[idx];
        idx += 4;
        this.transform1[rowIndex] = matrix.elements[idx];
        idx += 4;
        this.transform2[rowIndex] = matrix.elements[idx];
        idx += 4;
        this.transform3[rowIndex] = matrix.elements[idx];
        rowIndex++;
      }
    }

    this.attributes.push({
      name: 'matCol0',
      array: this.transform0,
      itemSize: 3
    });

    this.attributes.push({
      name: 'matCol1',
      array: this.transform1,
      itemSize: 3
    });

    this.attributes.push({
      name: 'matCol2',
      array: this.transform2,
      itemSize: 3
    });

    this.attributes.push({
      name: 'matCol3',
      array: this.transform3,
      itemSize: 3
    });
  }

  sort() {
    const newIndices = this.data.sort();
    this.capacity = this.data.count;

    const newTreeIndices = new Float32Array(this.capacity);
    newIndices.forEach((index, i) => {
      newTreeIndices[i] = this.treeIndex[index];
    });
    this.treeIndex = newTreeIndices;
    this.buildTreeIndexMap();

    this.setupAttributes();
    this.sorted = true;
  }
}
