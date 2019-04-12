// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { computeCircleBoundingBox } from './CircleGroup';
import { zAxis, twoPI } from './../constants';
import { FilterOptions } from '../parsers/parseUtils';
import GeometryGroupData from './GeometryGroupData';
import { colorProperties } from './GeometryGroupDataParameters';
import { Geometry } from 'three';
import { GeometryType } from './Types';

// reusable variables
const firstRotation = new THREE.Quaternion();
const secondRotation = new THREE.Quaternion();
const scale = new THREE.Vector3();
const tubeCenter = new THREE.Vector3();
const tubeNormal = new THREE.Vector3();
const reusableBox = new THREE.Box3();
const normalMatrix = new THREE.Matrix3();

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();

export default class TorusSegmentGroup extends PrimitiveGroup {
  public type: GeometryType;
  public data: GeometryGroupData;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'TorusSegment';
    this.data = new GeometryGroupData('TorusSegment', capacity, this.attributes);
  }

  add(
    nodeId: number,
    treeIndex: number,
    size: number,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    radius: number,
    tubeRadius: number,
    angle: number,
    arcAngle: number,
    filterOptions?: FilterOptions,
  ): boolean {
    this.setTreeIndex(treeIndex, this.data.count);
    this.data.add({
      size,
      center,
      normal,
      radius,
      tubeRadius,
      angle,
      arcAngle,
    });

    return this.filterLastObject(nodeId, filterOptions);
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    firstRotation.setFromAxisAngle(zAxis, this.data.getNumber('angle',  index));
    secondRotation.setFromUnitVectors(zAxis, this.data.getVector3('normal', vector1, index));
    scale.set(1, 1, 1);

    return outputMatrix.compose(
      this.data.getVector3('center', vector2, index),
      secondRotation.multiply(firstRotation), // A.multiply(B) === A*B
      scale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();

    normalMatrix.setFromMatrix4(matrix);
    secondRotation.setFromUnitVectors(zAxis, this.data.getVector3('normal', vector1, index));

    const radialSegmentAngle = twoPI / 24;
    const angle = this.data.getNumber('angle',  index);
    const arcAngle = this.data.getNumber('arcAngle',  index);
    const radius = this.data.getNumber('radius', index);

    const iterations = Math.ceil(arcAngle / radialSegmentAngle) + 1;
    for (let i = 0; i < iterations; ++i) {
      const zAngle = Math.min(angle + i * radialSegmentAngle, angle + arcAngle);
      const x = Math.cos(zAngle);
      const y = Math.sin(zAngle);
      tubeCenter
        .set(x * radius, y * radius, 0)
        .applyQuaternion(secondRotation)
        .add(this.data.getVector3('center', vector2, index))
        .applyMatrix4(matrix);
      tubeNormal
        .set(y, -x, 0)
        .applyQuaternion(secondRotation)
        .applyMatrix3(normalMatrix);
      box.union(
        computeCircleBoundingBox(
          tubeCenter,
          tubeNormal,
          this.data.getNumber('tubeRadius', index),
          reusableBox,
        ),
      );
    }

    return box;
  }
}
