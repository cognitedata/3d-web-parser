// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeometryGroup from './GeometryGroup';

export default class MergedMeshGroup extends GeometryGroup {
  constructor() {
    super();
    this.type = 'MergedMesh';
  }

  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return box;
  }
}
