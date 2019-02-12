// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { zAxis } from '../constants';
import { FilterOptions } from '../parsers/parseUtils';
import GeometryGroupData from './GeometryGroupData';

// reusable variables
const globalDot = new THREE.Vector3();
const globalQuaternion = new THREE.Quaternion();
const globalNormalMatrix = new THREE.Matrix3();
const globalTransformedCenter = new THREE.Vector3();
const globalTransformedNormal = new THREE.Vector3();
const globalNormal = new THREE.Vector3();
const globalCenter = new THREE.Vector3();
const globalScale = new THREE.Vector3();

export function computeCircleBoundingBox(
  center: THREE.Vector3,
  normal: THREE.Vector3,
  radius: number,
  box: THREE.Box3,
) {
  normal.normalize();
  globalDot.multiplyVectors(normal, normal);
  const twoRadius = 2 * radius;
  const size = globalDot.set(
    twoRadius * Math.sqrt(1 - globalDot.x),
    twoRadius * Math.sqrt(1 - globalDot.y),
    twoRadius * Math.sqrt(1 - globalDot.z),
  );

  return box.setFromCenterAndSize(center, size);
}

export default class CircleGroup extends PrimitiveGroup {
  public data: GeometryGroupData;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'Circle';
    this.data = new GeometryGroupData('Circle', capacity, this.attributes);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
    filterOptions?: FilterOptions,
  ) {
    this.setNodeId(nodeId, this.data.count);
    this.setTreeIndex(treeIndex, this.data.count);
    this.setColor(color, this.data.count);
    this.data.add({
      center: center,
      normal: normal,
      radiusA: radius,
    });

    if (filterOptions) {
      this.filterLastObject(filterOptions);
    }
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    globalQuaternion.setFromUnitVectors(zAxis, this.data.getVector3('normal', globalNormal, index));
    const twoRadius = 2 * this.data.getNumber('radiusA', index);
    globalScale.set(twoRadius, twoRadius, 1);
    return outputMatrix.compose(
      this.data.getVector3('centerA', globalCenter, index),
      globalQuaternion, // Rotation
      globalScale, // Scale
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    globalNormalMatrix.setFromMatrix4(matrix);
    globalTransformedCenter.copy(this.data.getVector3('centerA', globalCenter, index)).applyMatrix4(matrix);
    globalTransformedNormal.copy(this.data.getVector3('normal', globalNormal, index)).applyMatrix3(globalNormalMatrix);
    const scaling = matrix.getMaxScaleOnAxis();
    const radius = scaling * this.data.getNumber('radiusA', index);

    return computeCircleBoundingBox(
      globalTransformedCenter,
      globalTransformedNormal,
      radius,
      box,
    );
  }
}
