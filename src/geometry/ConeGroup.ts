// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { computeCircleBoundingBox } from './CircleGroup';
import { xAxis, zAxis } from '../constants';
import { FilterOptions } from '../parsers/parseUtils';
import { RenderedPrimitiveNameType } from './Types';
import PrimitiveGroupData from './PrimitiveGroupData';
import { normalizeRadians } from '../MathUtils';

// reusable variables
const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const center = new THREE.Vector3();
const normal = new THREE.Vector3();
const normalMatrix = new THREE.Matrix3();
const reusableBox = new THREE.Box3();
const localXAxis = new THREE.Vector3();
const rotation = new THREE.Quaternion();

export default class ConeGroup extends PrimitiveGroup {
  public type: RenderedPrimitiveNameType;
  public data: PrimitiveGroupData;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'Cone';
    this.hasCustomTransformAttributes = true;
    this.data = new PrimitiveGroupData('Cone', capacity);
  }

  add(
    nodeId: number,
    treeIndex: number,
    size: number,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radiusA: number,
    radiusB: number,
    angle: number,
    arcAngle: number,
    filterOptions?: FilterOptions
  ): boolean {
    this.setTreeIndex(treeIndex, this.data.count);
    normal.subVectors(centerA, centerB).normalize();
    rotation.setFromUnitVectors(zAxis, normal);
    localXAxis.copy(xAxis).applyQuaternion(rotation);
    angle = normalizeRadians(angle);

    this.data.add({
      size,
      centerA,
      centerB,
      radiusA,
      radiusB,
      angle,
      arcAngle,
      localXAxis
    });

    return this.filterLastObject(nodeId, filterOptions);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix.identity();
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    normalMatrix.setFromMatrix4(matrix);
    const scaling = matrix.getMaxScaleOnAxis();

    normal
      .subVectors(this.data.getVector3('centerA', vector1, index), this.data.getVector3('centerB', vector2, index))
      .applyMatrix3(normalMatrix)
      .normalize();

    box.makeEmpty();

    // A
    center.copy(this.data.getVector3('centerA', vector1, index)).applyMatrix4(matrix);
    let radius = scaling * this.data.getNumber('radiusA', index);
    box.union(computeCircleBoundingBox(center, normal, radius, reusableBox));

    // B
    center.copy(this.data.getVector3('centerB', vector2, index)).applyMatrix4(matrix);
    radius = scaling * this.data.getNumber('radiusB', index);
    box.union(computeCircleBoundingBox(center, normal, radius, reusableBox));

    return box;
  }
}
