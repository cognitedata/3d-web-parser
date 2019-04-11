// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from '../geometry/PrimitiveGroup';
import { expectColorEqual } from '../TestUtils';
import { GeometryType } from '../geometry/Types';
class NonAbstractPrimitiveGroup extends PrimitiveGroup {
  public type: GeometryType;
  constructor(capacity: number) {
    super(capacity);
    this.type = 'Box'; // Any valid type
  }
  computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4 {
    return new THREE.Matrix4();
  }
  computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3 {
    return new THREE.Box3();
  }
}

describe('PrimitiveGroup', () => {
  test('constructor', () => {
    const group = new NonAbstractPrimitiveGroup(2);
    expect(group.data.count).toBe(0);
    expect(group.capacity).toBe(2);
    expect(group.treeIndex.length).toBe(2);
  });

  test('setTreeIndex', () => {
    const group = new NonAbstractPrimitiveGroup(2);
    group.setTreeIndex(10, 0);
    expect(group.treeIndex[0]).toBe(10);
    group.setTreeIndex(20, 0);
    expect(group.treeIndex[0]).toBe(20);
    group.setTreeIndex(10, 1);
    expect(group.treeIndex[0]).toBe(20);
    expect(group.treeIndex[1]).toBe(10);
  });

  test('getTreeIndex', () => {
    const group = new NonAbstractPrimitiveGroup(2);
    group.setTreeIndex(10, 0);
    group.setTreeIndex(20, 1);
    expect(group.getTreeIndex(0)).toBe(10);
    expect(group.getTreeIndex(1)).toBe(20);
  });
});
