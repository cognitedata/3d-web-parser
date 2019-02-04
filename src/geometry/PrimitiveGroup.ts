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
const matrix = new THREE.Matrix4();

type TypedArray = Float32Array | Float64Array;
type THREEVector = THREE.Vector2 | THREE.Vector3 | THREE.Vector4;

export interface PrimitiveGroupMap {
  Box: {capacity: number, group: BoxGroup};
  Circle: {capacity: number, group: CircleGroup};
  Cone: {capacity: number, group: ConeGroup};
  EccentricCone: {capacity: number, group: EccentricConeGroup};
  EllipsoidSegment: {capacity: number, group: EllipsoidSegmentGroup};
  GeneralCylinder: {capacity: number, group: GeneralCylinderGroup};
  GeneralRing: {capacity: number, group: GeneralRingGroup};
  Nut: {capacity: number, group: NutGroup};
  Quad: {capacity: number, group: QuadGroup};
  SphericalSegment: {capacity: number, group: SphericalSegmentGroup};
  TorusSegment: {capacity: number, group: TorusSegmentGroup};
  Trapezium: {capacity: number, group: TrapeziumGroup};
}

export interface Attribute {
  name: string;
  array: TypedArray;
  itemSize: number;
}

interface TreeIndexMap {
  [s: number]: number;
}

export default abstract class PrimitiveGroup extends GeometryGroup {
  public count: number;
  public capacity: number;
  public nodeId: Float64Array;
  public treeIndex: Float32Array;
  public color: Float32Array;
  public maxTreeIndex: number;
  public treeIndexMap: TreeIndexMap;

  // The transformX arrays contain contain transformation matrix
  public transform0: Float32Array;
  public transform1: Float32Array;
  public transform2: Float32Array;
  public transform3: Float32Array;
  public hasCustomTransformAttributes: boolean;
  public attributes: Attribute[];
  constructor(capacity: number) {
    super();
    this.count = 0;
    this.capacity = capacity;
    this.treeIndexMap = {};

    this.maxTreeIndex = -1;
    this.nodeId = new Float64Array(this.capacity);
    this.treeIndex = new Float32Array(this.capacity);
    this.color = new Float32Array(3 * this.capacity);
    this.transform0 = new Float32Array(0);
    this.transform1 = new Float32Array(0);
    this.transform2 = new Float32Array(0);
    this.transform3 = new Float32Array(0);
    this.attributes = [
      { name: 'treeIndex', array: this.treeIndex, itemSize: 1 },
    ];
    this.hasCustomTransformAttributes = false;
  }

  abstract computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4;
  abstract computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3;

  setVector<T extends TypedArray, U extends THREEVector>(
    source: U,
    target: T,
    index: number,
  ) {
    // @ts-ignore
    if (source.isVector2) {
      target[2 * index + 0] = source.x;
      target[2 * index + 1] = source.y;
      // @ts-ignore
    } else if (source.isVector3) {
      target[3 * index + 0] = source.x;
      target[3 * index + 1] = source.y;
      // @ts-ignore
      target[3 * index + 2] = source.z;
      // @ts-ignore
    } else if (source.isVector4) {
      target[4 * index + 0] = source.x;
      target[4 * index + 1] = source.y;
      // @ts-ignore
      target[4 * index + 2] = source.z;
      // @ts-ignore
      target[4 * index + 3] = source.w;
    }
  }

  getVector<T extends TypedArray, U extends THREEVector>(
    array: T,
    target: U,
    index: number,
  ): U {
    // @ts-ignore
    if (target.isVector2) {
      // @ts-ignore
      target.set(
        array[2 * index + 0],
        array[2 * index + 1],
        array[2 * index + 2],
      );
      // @ts-ignore
    } else if (target.isVector3) {
      // @ts-ignore
      target.set(
        array[3 * index + 0],
        array[3 * index + 1],
        array[3 * index + 2],
      );
      // @ts-ignore
    } else if (target.isVector4) {
      // @ts-ignore
      target.set(
        array[4 * index + 0],
        array[4 * index + 1],
        array[4 * index + 2],
        array[4 * index + 3],
      );
    }

    return target;
  }

  setColor(source: THREE.Color, index: number) {
    this.color[3 * index + 0] = source.r;
    this.color[3 * index + 1] = source.g;
    this.color[3 * index + 2] = source.b;
  }

  getColor(target: THREE.Color, index: number): THREE.Color {
    target.setRGB(
      this.color[3 * index + 0],
      this.color[3 * index + 1],
      this.color[3 * index + 2],
    );
    return target;
  }

  setNodeId(value: number, index: number) {
    this.nodeId[index] = value;
  }

  setTreeIndex(value: number, index: number) {
    this.maxTreeIndex = Math.max(this.maxTreeIndex, value);
    this.treeIndexMap[value] = index;
    this.treeIndex[index] = value;
  }

  getNodeId(index: number): number {
    return this.nodeId[index];
  }

  getTreeIndex(index: number): number {
    return this.treeIndex[index];
  }

  computeTransformAttributes() {
    if (this.hasCustomTransformAttributes) {
      return;
    }

    // the 3x4 matrix to the shader.
    // This array has length 4 (four columns in the matrix)
    // and will contain block of 3 numbers (one block per object)
    this.transform0 = new Float32Array(3 * this.count);
    this.transform1 = new Float32Array(3 * this.count);
    this.transform2 = new Float32Array(3 * this.count);
    this.transform3 = new Float32Array(3 * this.count);

    let rowIndex = 0;

    for (let i = 0; i < this.count; i++) {
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
      itemSize: 3,
    });

    this.attributes.push({
      name: 'matCol1',
      array: this.transform1,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'matCol2',
      array: this.transform2,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'matCol3',
      array: this.transform3,
      itemSize: 3,
    });
  }
}
