// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from './PlaneGroup';
import { computeCircleBoundingBox } from './CircleGroup';
import { zAxis } from './../constants';

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

// reusable variables
const normalMatrix = new THREE.Matrix3();
const transformedCenter = new THREE.Vector3();
const transformedNormal = new THREE.Vector3();
const circleCenter = new THREE.Vector3();
const reusableBox = new THREE.Box3();
const center = new THREE.Vector3();
const normal = new THREE.Vector3();

export default class EllipsoidSegmentGroup extends PlaneGroup {
  public horizontalRadius: Float32Array;
  public verticalRadius: Float32Array;
  public height: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'EllipsoidSegment';
    this.height = new Float32Array(capacity);
    this.horizontalRadius = new Float32Array(capacity);
    this.verticalRadius = new Float32Array(capacity);
    this.hasCustomTransformAttributes = true;

    this.attributes.push({
      name: 'a_center',
      array: this.center,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'a_normal',
      array: this.normal,
      itemSize: 3,
    });

    this.attributes.push({
      name: 'a_hRadius',
      array: this.horizontalRadius,
      itemSize: 1,
    });

    this.attributes.push({
      name: 'a_vRadius',
      array: this.verticalRadius,
      itemSize: 1,
    });

    this.attributes.push({
      name: 'a_height',
      array: this.height,
      itemSize: 1,
    });
  }

  setHeight(value: number, index: number) {
    this.height[index] = value;
  }

  getHeight(index: number): number {
    return this.height[index];
  }

  setHorizontalRadius(value: number, index: number) {
    this.horizontalRadius[index] = value;
  }

  getHorizontalRadius(index: number): number {
    return this.horizontalRadius[index];
  }

  setVerticalRadius(value: number, index: number) {
    this.verticalRadius[index] = value;
  }

  getVerticalRadius(index: number): number {
    return this.verticalRadius[index];
  }

  // @ts-ignore
  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    horizontalRadius: number,
    verticalRadius: number,
    height: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setNormal(normal, this.count);
    this.setHorizontalRadius(horizontalRadius, this.count);
    this.setVerticalRadius(verticalRadius, this.count);
    this.setHeight(height, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix.identity();
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();

    normalMatrix.setFromMatrix4(matrix);

    transformedCenter.copy(this.getCenter(center, index)).applyMatrix4(matrix);
    transformedNormal
      .copy(this.getNormal(normal, index))
      .applyMatrix3(normalMatrix)
      .normalize();

    const height = this.getHeight(index);
    const hRadius = this.getHorizontalRadius(index);
    const vRadius = this.getVerticalRadius(index);

    const segments = 16;
    const step = hRadius / segments;
    for (let z = vRadius - height; z < vRadius; z += step) {
      const circleRadius = Math.sqrt(vRadius * vRadius - z * z) * hRadius / vRadius;
      circleCenter.copy(transformedNormal).multiplyScalar(z).add(transformedCenter);

      box.union(
        computeCircleBoundingBox(
          circleCenter,
          transformedNormal,
          circleRadius,
          reusableBox,
        ),
      );
    }

    // union the point which maximizes z
    box.expandByPoint(
      circleCenter.copy(transformedNormal).multiplyScalar(vRadius).add(transformedCenter),
    );

    return box;
  }
}
