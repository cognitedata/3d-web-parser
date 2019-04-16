// Copyright 2019 Cognite AS

import * as THREE from 'three';
import { identityMatrix4 } from '../constants';

const globalVector = new THREE.Vector3();

export function computeBoundingBox(
  box: THREE.Box3,
  matrix: THREE.Matrix4,
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  index: THREE.BufferAttribute,
  triangleOffset: number,
  triangleCount: number
) {
  box.makeEmpty();
  const start = 3 * triangleOffset;
  const end = start + 3 * triangleCount;
  const { array } = index;
  const isIdentity = matrix.equals(identityMatrix4);
  for (let i = start; i < end; i++) {
    const idx = array[i];
    globalVector.set(position.getX(idx), position.getY(idx), position.getZ(idx));
    if (!isIdentity) {
      globalVector.applyMatrix4(matrix);
    }
    box.expandByPoint(globalVector);
  }
  return box;
}
