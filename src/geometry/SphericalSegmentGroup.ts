// Copyright 2019 Cognite AS

import PrimitiveGroup from './PrimitiveGroup';
import { computeCircleBoundingBox } from './CircleGroup';
import * as THREE from 'three';

// constants
type triplet = [number, number, number];
const points: triplet[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

// reusable variables
const transformedCenter = new THREE.Vector3();
const transformedNormal = new THREE.Vector3();
const normalMatrix = new THREE.Matrix3();
const point = new THREE.Vector3();
const direction = new THREE.Vector3();
const sphereCenter = new THREE.Vector3();
const center = new THREE.Vector3();
const normal = new THREE.Vector3();

export default class SphericalSegmentGroup extends PrimitiveGroup {
  static type = 'SphericalSegment';
  public center: Float32Array;
  public radius: Float32Array;
  public normal: Float32Array;
  public height: Float32Array;

  constructor(capacity: number) {
    super(capacity);
    this.center = new Float32Array(3 * capacity);
    this.radius = new Float32Array(capacity);
    this.normal = new Float32Array(3 * capacity);
    this.height = new Float32Array(capacity);
  }

  setCenter(source: THREE.Vector3, index: number) {
    this.setVector(source, this.center, index);
  }

  getCenter(target: THREE.Vector3, index: number) {
    return this.getVector(this.center, target, index);
  }

  setRadius(value: number, index: number) {
    this.radius[index] = value;
  }

  getRadius(index: number): number {
    return this.radius[index];
  }

  setNormal(source: THREE.Vector3, index: number) {
    this.setVector(source, this.normal, index);
  }

  getNormal(target: THREE.Vector3, index: number) {
    return this.getVector(this.normal, target, index);
  }

  setHeight(value: number, index: number) {
    this.height[index] = value;
  }

  getHeight(index: number): number {
    return this.height[index];
  }

  // @ts-ignore
  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
    height: number,
  ) {
    this.setNodeId(nodeId, this.count);
    this.setTreeIndex(treeIndex, this.count);
    this.setColor(color, this.count);
    this.setCenter(center, this.count);
    this.setRadius(radius, this.count);
    this.setNormal(normal, this.count);
    this.setHeight(height, this.count);
    this.count += 1;
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix.identity();
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    normalMatrix.setFromMatrix4(matrix);
    transformedNormal
      .copy(this.getNormal(normal, index))
      .applyMatrix3(normalMatrix)
      .normalize();
    const scaling = matrix.getMaxScaleOnAxis();
    const radius = scaling * this.getRadius(index);
    const height = scaling * this.getHeight(index);

    sphereCenter.copy(this.getCenter(center, index)).applyMatrix4(matrix);
    transformedCenter
      .copy(sphereCenter)
      .add(direction.copy(transformedNormal).multiplyScalar(radius - height));
    box = computeCircleBoundingBox(
      transformedCenter,
      transformedNormal,
      Math.sqrt(radius * radius - (radius - height) * (radius - height)),
      box,
    );

    points.forEach(p => {
      const dot = point
        .set(p[0], p[1], p[2])
        .multiplyScalar(radius)
        .add(sphereCenter)
        .sub(transformedCenter)
        .dot(transformedNormal);
      const EPS = 1e-6;
      if (dot >= -EPS) {
        box.expandByPoint(
          point
            .set(p[0], p[1], p[2])
            .multiplyScalar(radius)
            .add(sphereCenter),
        );
      }
    });

    return box;
  }
}
