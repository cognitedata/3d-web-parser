import * as THREE from 'three';
import { identityMatrix4 } from '../constants';
import { zAxis } from '../constants';

const globalVector = new THREE.Vector3();
const globalCenter = new THREE.Vector3();
const globalRotation = new THREE.Quaternion();
const globalScale = new THREE.Vector3();
const SI = new THREE.Matrix4();
SI.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1);
const globalMatrix = new THREE.Matrix4();
const globalMatrix2 = new THREE.Matrix4();
const globalArray = new Array(16);
const globalSize = new THREE.Vector3();

export function computeBoundingBox(
  box: THREE.Box3,
  matrix: THREE.Matrix4,
  position: THREE.BufferAttribute|THREE.InterleavedBufferAttribute,
  index: THREE.BufferAttribute,
  triangleOffset: number,
  triangleCount: number,
) {
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
