// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from './PrimitiveGroup';
import { zAxis } from '../constants';
import { FilterOptions } from '../parsers/parseUtils';
import GeometryGroupData from './GeometryGroupData';

// reusable variables
const firstRotation = new THREE.Quaternion();
const secondRotation = new THREE.Quaternion();
const fullMatrix = new THREE.Matrix4();
const globalNormal = new THREE.Vector3();
const globalDelta = new THREE.Vector3();
const globalCenter = new THREE.Vector3();
const globalPoint = new THREE.Vector3();

export default class BoxGroup extends PrimitiveGroup {
  public data: GeometryGroupData;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'Box';
    this.hasCustomTransformAttributes = false;
    this.data = new GeometryGroupData('Box', capacity, this.attributes);
  }

  add(
    nodeId: number,
    treeIndex: number,
    color: THREE.Color,
    center: THREE.Vector3,
    normal: THREE.Vector3,
    angle: number,
    delta: THREE.Vector3,
    filterOptions?: FilterOptions,
  ) {
    this.setNodeId(nodeId, this.data.count);
    this.setTreeIndex(treeIndex, this.data.count);
    this.setColor(color, this.data.count);
    this.data.add({
      center,
      normal,
      angle,
      delta,
    });

    if (filterOptions) {
      this.filterLastObject(filterOptions);
    }
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    firstRotation.setFromAxisAngle(zAxis, this.data.getNumber('angle', index));
    secondRotation.setFromUnitVectors(zAxis, this.data.getVector3('normal', globalNormal, index));
    const scale = this.data.getVector3('delta', globalDelta, index);
    return outputMatrix.compose(
      this.data.getVector3('center', globalCenter, index),
      secondRotation.multiply(firstRotation), // A.multiply(B) === A*B
      scale,
    );
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    box.makeEmpty();
    this.computeModelMatrix(fullMatrix, index).premultiply(matrix);
    const coords = [-0.5, 0.5];
    coords.forEach(x =>
      coords.forEach(y =>
        coords.forEach(z =>
          box.expandByPoint(globalPoint.set(x, y, z).applyMatrix4(fullMatrix)),
        ),
      ),
    );

    return box;
  }
}
