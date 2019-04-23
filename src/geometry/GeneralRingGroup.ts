// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { computeEllipsoidBoundingBox } from './EllipsoidSegmentGroup';
import { FilterOptions } from '../parsers/parseUtils';
import GeometryGroupData from './GeometryGroupData';
import { angleBetweenVector3s } from '../parsers/protobuf/protobufUtils';
import { GeometryType } from './Types';
import { normalize } from 'path';

// reusable variables
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();
const rotationMatrix = new THREE.Matrix4();
const localYAxis = new THREE.Vector3();

const globalNormal = new THREE.Vector3();
const globalLocalXAxis = new THREE.Vector3();
const globalCenter = new THREE.Vector3();

export default class GeneralRingGroup extends PrimitiveGroup {
  public type: GeometryType;
  public data: GeometryGroupData;

  constructor(capacity: number) {
    super(capacity);
    this.type = 'GeneralRing';
    this.hasCustomTransformAttributes = false;
    this.data = new GeometryGroupData('GeneralRing', capacity, this.attributes);
  }

  add(
    nodeId: number,
    treeIndex: number,
    size: number,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    localXAxis: THREE.Vector3,
    xRadius: number,
    yRadius: number,
    thickness: number,
    angle: number,
    arcAngle: number,
    filterOptions?: FilterOptions
  ): boolean {
    this.setTreeIndex(treeIndex, this.data.count);
    this.data.add({
      size,
      center,
      normal,
      localXAxis,
      radiusA: xRadius,
      radiusB: yRadius,
      thickness: thickness / yRadius,
      angle,
      arcAngle
    });

    return this.filterLastObject(nodeId, filterOptions);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    this.data.getVector3('normal', globalNormal, index);
    this.data.getVector3('localXAxis', globalLocalXAxis, index);
    localYAxis.crossVectors(
      this.data.getVector3('normal', globalNormal, index),
      this.data.getVector3('localXAxis', globalLocalXAxis, index)
    );
    rotationMatrix.set(
      globalLocalXAxis.x,
      localYAxis.x,
      globalNormal.x,
      0,
      globalLocalXAxis.y,
      localYAxis.y,
      globalNormal.y,
      0,
      globalLocalXAxis.z,
      localYAxis.z,
      globalNormal.z,
      0,
      0,
      0,
      0,
      1
    );

    rotation.setFromRotationMatrix(rotationMatrix);
    scale.set(2 * this.data.getNumber('radiusA', index), 2 * this.data.getNumber('radiusB', index), 1);
    return outputMatrix.compose(
      this.data.getVector3('center', globalCenter, index),
      rotation,
      scale
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return computeEllipsoidBoundingBox(
      this.data.getVector3('center', globalCenter, index),
      this.data.getVector3('normal', globalNormal, index),
      this.data.getNumber('radiusA', index),
      this.data.getNumber('radiusB', index),
      0,
      matrix,
      box
    );
  }
}
