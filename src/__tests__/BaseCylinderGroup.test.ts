// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BaseCylinderGroup from '../geometry/BaseCylinderGroup';
import { expectVector3Equal } from '../TestUtils';
class NonAbstractBaseCylinderGroup extends BaseCylinderGroup {
  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return outputMatrix;
  }

  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return box;
  }
}

describe('CylinderGroup', () => {
  test('constructor', () => {
    const group = new NonAbstractBaseCylinderGroup(2);
    expect(group.centerA.length).toBe(6);
    expect(group.centerB.length).toBe(6);
  });

  test('(set/get)CenterA', () => {
    const group = new NonAbstractBaseCylinderGroup(2);

    const center = new THREE.Vector3(1, 2, 3);
    const target = new THREE.Vector3();
    group.setCenterA(center, 0);
    group.getCenterA(target, 0);
    expectVector3Equal(target, center);
  });

  test('(set/get)CenterB', () => {
    const group = new NonAbstractBaseCylinderGroup(2);

    const center = new THREE.Vector3(1, 2, 3);
    const target = new THREE.Vector3();
    group.setCenterB(center, 0);
    group.getCenterB(target, 0);
    expectVector3Equal(target, center);
  });
});
