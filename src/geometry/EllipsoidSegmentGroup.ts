// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { computeCircleBoundingBox } from './CircleGroup';
import { zAxis } from './../constants';
import { FilterOptions } from '../parsers/parseUtils';
import { GeometryType } from './Types';
import GeometryGroupData from './GeometryGroupData';

// reusable variables
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();
const SI = new THREE.Matrix4();
SI.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1);
const M = new THREE.Matrix4();
const MT = new THREE.Matrix4();
const boundingBoxCenter = new THREE.Vector3();
const size = new THREE.Vector3();
const arr = new Array(16);

// reusable variables
const globalNormalMatrix = new THREE.Matrix3();
const globalTransformedCenter = new THREE.Vector3();
const globalTransformedNormal = new THREE.Vector3();
const globalCircleCenter = new THREE.Vector3();
const globalReusableBox = new THREE.Box3();
const globalCenter = new THREE.Vector3();
const globalNormal = new THREE.Vector3();

// (haowei.guo) I found this ellipsoid bounding box algorithm from stackoverflow
// https://stackoverflow.com/questions/4368961/calculating-an-aabb-for-a-transformed-sphere/4369956#4369956
export function computeEllipsoidBoundingBox(
  center: THREE.Vector3,
  normal: THREE.Vector3,
  xRadius: number,
  yRadius: number,
  zRadius: number,
  matrix: THREE.Matrix4,
  box: THREE.Box3,
): THREE.Box3 {
  rotation.setFromUnitVectors(zAxis, normal);
  scale.set(2 * xRadius, 2 * yRadius, 2 * zRadius);
  M.compose(
    center,
    rotation,
    scale,
  ).premultiply(matrix);

  MT.copy(M).transpose();
  M.multiply(SI);
  M.multiply(MT);
  // @ts-ignore
  M.toArray(arr);
  const r11 = arr[0];
  const r14 = arr[3];
  const r22 = arr[5];
  const r24 = arr[7];
  const r33 = arr[10];
  const r34 = arr[11];
  const r44 = arr[15];
  boundingBoxCenter.set(r14 / r44, r24 / r44, r34 / r44);
  size.set(
    Math.abs(Math.sqrt(r14 * r14 - r44 * r11) / r44),
    Math.abs(Math.sqrt(r24 * r24 - r44 * r22) / r44),
    Math.abs(Math.sqrt(r34 * r34 - r44 * r33) / r44),
  );
  box.setFromCenterAndSize(boundingBoxCenter, size);

  return box;
}

export default class EllipsoidSegmentGroup extends PrimitiveGroup {
  public type: GeometryType;
  public data: GeometryGroupData;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'EllipsoidSegment';
    this.hasCustomTransformAttributes = true;
    this.data = new GeometryGroupData('EllipsoidSegment', capacity, this.attributes);
  }

  add(
    nodeId: number,
    treeIndex: number,
    diagonalSize: number,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    horizontalRadius: number,
    verticalRadius: number,
    height: number,
    filterOptions?: FilterOptions,
  ): boolean {
    this.setTreeIndex(treeIndex, this.data.count);
    this.data.add({
      diagonalSize,
      center,
      normal,
      hRadius: horizontalRadius,
      vRadius: verticalRadius,
      height,
    });

    return this.filterLastObject(nodeId, filterOptions);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix.identity();
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();

    globalNormalMatrix.setFromMatrix4(matrix);

    globalTransformedCenter.copy(this.data.getVector3('center', globalCenter, index)).applyMatrix4(matrix);
    globalTransformedNormal
      .copy(this.data.getVector3('normal', globalNormal, index))
      .applyMatrix3(globalNormalMatrix)
      .normalize();

    const height = this.data.getNumber('height', index);
    const hRadius = this.data.getNumber('hRadius', index);
    const vRadius = this.data.getNumber('vRadius', index);

    const segments = 16;
    const step = hRadius / segments;
    for (let z = vRadius - height; z < vRadius; z += step) {
      const circleRadius = Math.sqrt(vRadius * vRadius - z * z) * hRadius / vRadius;
      globalCircleCenter.copy(globalTransformedNormal).multiplyScalar(z).add(globalTransformedCenter);

      box.union(
        computeCircleBoundingBox(
          globalCircleCenter,
          globalTransformedNormal,
          circleRadius,
          globalReusableBox,
        ),
      );
    }

    // union the point which maximizes z
    box.expandByPoint(
      globalCircleCenter.copy(globalTransformedNormal).multiplyScalar(vRadius).add(globalTransformedCenter),
    );

    return box;
  }
}
