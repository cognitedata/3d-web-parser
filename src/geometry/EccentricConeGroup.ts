// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { computeCircleBoundingBox } from './CircleGroup';
import { FilterOptions } from '../parsers/parseUtils';
import { GeometryType } from './Types';
import GeometryGroupData from './GeometryGroupData';

// reusable variables
const globalNormalMatrix = new THREE.Matrix3();
const globalReusableBox = new THREE.Box3();
const globalCenter = new THREE.Vector3();
const globalNormal = new THREE.Vector3();
const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();

export default class EccentricConeGroup extends PrimitiveGroup {
  public type: GeometryType;
  public data: GeometryGroupData;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'EccentricCone';
    this.hasCustomTransformAttributes = true;
    this.data = new GeometryGroupData('EccentricCone', capacity, this.attributes);
  }

  add(
    nodeId: number,
    treeIndex: number,
    diagonalSize: number,
    centerA: THREE.Vector3,
    centerB: THREE.Vector3,
    radiusA: number,
    radiusB: number,
    normal: THREE.Vector3,
    filterOptions?: FilterOptions,
  ): boolean {
    this.setTreeIndex(treeIndex, this.data.count);
    this.data.add({
      diagonalSize,
      centerA,
      centerB,
      radiusA,
      radiusB,
      normal,
    });

    return this.filterLastObject(nodeId, filterOptions);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix.identity();
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    globalNormalMatrix.setFromMatrix4(matrix);
    const scaling = matrix.getMaxScaleOnAxis();

    box.makeEmpty();
    globalNormal.copy(this.data.getVector3('normal', globalNormal, index)).applyMatrix3(globalNormalMatrix).normalize();

    // A
    globalCenter.copy(this.data.getVector3('centerA', globalCenterA, index)).applyMatrix4(matrix);
    let radius = scaling * this.data.getNumber('radiusA', index);
    box.union(computeCircleBoundingBox(globalCenter, globalNormal, radius, globalReusableBox));

    // B
    globalCenter.copy(this.data.getVector3('centerB', globalCenterB, index)).applyMatrix4(matrix);
    radius = scaling * this.data.getNumber('radiusB', index);
    box.union(computeCircleBoundingBox(globalCenter, globalNormal, radius, globalReusableBox));

    return box;
  }
}
