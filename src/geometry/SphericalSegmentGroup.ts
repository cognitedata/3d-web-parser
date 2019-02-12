// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { computeCircleBoundingBox } from './CircleGroup';
import { FilterOptions } from '../parsers/parseUtils';
import GeometryGroupData from './GeometryGroupData';
import { colorProperties } from './GeometryGroupDataParameters';

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
const globalCenter = new THREE.Vector3();
const globalNormal = new THREE.Vector3();

export default class SphericalSegmentGroup extends PrimitiveGroup {
  public data: GeometryGroupData;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'SphericalSegment';
    this.hasCustomTransformAttributes = true;
    this.data = new GeometryGroupData('SphericalSegment', capacity, this.attributes);
    this.attributes.push({
      name: 'a_vRadius',
      array: this.data.arrays.hRadius,
      itemSize: 3,
    });
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
    filterOptions?: FilterOptions,
  ) {
    this.setNodeId(nodeId, this.data.count);
    this.setTreeIndex(treeIndex, this.data.count);
    this.setColor(color, this.data.count);
    this.data.add({
      center: center,
      normal: normal,
      hRadius: radius,
      height: height,
    });

    if (filterOptions) {
      this.filterLastObject(filterOptions);
    }
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix.identity();
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    normalMatrix.setFromMatrix4(matrix);
    transformedNormal
      .copy(this.data.getVector3('normal', globalNormal, index))
      .applyMatrix3(normalMatrix)
      .normalize();
    const scaling = matrix.getMaxScaleOnAxis();
    const radius = scaling * this.data.getNumber('radiusA', index);
    const height = scaling * this.data.getNumber('heightA', index);

    sphereCenter.copy(this.data.getVector3('centerA', globalCenter, index)).applyMatrix4(matrix);
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
