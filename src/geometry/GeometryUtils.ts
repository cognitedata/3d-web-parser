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

// (haowei.guo) I found this ellipsoid bounding box algorithm from stackoverflow
// https://stackoverflow.com/questions/4368961/calculating-an-aabb-for-a-transformed-sphere/4369956#4369956
export function computeEllipsoidBoundingBox(
  center: THREE.Vector3,
  normal: THREE.Vector3,
  xRadius: number,
  yRadius: number,
  zRadius: number,
  matrix: THREE.Matrix4,
  box: THREE.Box3,
): THREE.Box3 {
  globalRotation.setFromUnitVectors(zAxis, normal);
  globalScale.set(2 * xRadius, 2 * yRadius, 2 * zRadius);
  globalMatrix.compose(
    center,
    globalRotation,
    globalScale,
  ).premultiply(matrix);

  globalMatrix2.copy(globalMatrix).transpose();
  globalMatrix.multiply(SI);
  globalMatrix.multiply(globalMatrix2);
  // @ts-ignore
  globalMatrix.toArray(globalArray);
  const r11 = globalArray[0];
  const r14 = globalArray[3];
  const r22 = globalArray[5];
  const r24 = globalArray[7];
  const r33 = globalArray[10];
  const r34 = globalArray[11];
  const r44 = globalArray[15];
  globalCenter.set(r14 / r44, r24 / r44, r34 / r44);
  globalSize.set(
    Math.abs(Math.sqrt(r14 * r14 - r44 * r11) / r44),
    Math.abs(Math.sqrt(r24 * r24 - r44 * r22) / r44),
    Math.abs(Math.sqrt(r34 * r34 - r44 * r33) / r44),
  );
  box.setFromCenterAndSize(globalCenter, globalSize);

  return box;
}
