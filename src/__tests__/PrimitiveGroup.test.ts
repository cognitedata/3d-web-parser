// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PrimitiveGroup from '../geometry/PrimitiveGroup';
import { expectColorEqual } from '../TestUtils';
class NonAbstractPrimitiveGroup extends PrimitiveGroup {
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
    expect(group.count).toBe(0);
    expect(group.capacity).toBe(2);
    expect(group.nodeId.length).toBe(2);
    expect(group.treeIndex.length).toBe(2);
    expect(group.color.length).toBe(6);
  });

  test('setVector', () => {
    const group = new NonAbstractPrimitiveGroup(0);

    const array = new Float32Array(6);
    {
      // Test with THREE.Vector3
      const vector1 = new THREE.Vector3(1, 2, 3);
      const vector2 = new THREE.Vector3(10, 20, 30);
      group.setVector(vector1, array, 0);
      group.setVector(vector2, array, 1);
      expect(array[0]).toBeCloseTo(vector1.x);
      expect(array[1]).toBeCloseTo(vector1.y);
      expect(array[2]).toBeCloseTo(vector1.z);
      expect(array[3]).toBeCloseTo(vector2.x);
      expect(array[4]).toBeCloseTo(vector2.y);
      expect(array[5]).toBeCloseTo(vector2.z);
    }

    {
      // Test with THREE.Vector2
      const vector1 = new THREE.Vector2(5, 6);
      const vector2 = new THREE.Vector2(11, 21);
      const vector3 = new THREE.Vector2(51, 61);
      group.setVector(vector1, array, 0);
      group.setVector(vector2, array, 1);
      group.setVector(vector3, array, 2);
      expect(array[0]).toBeCloseTo(vector1.x);
      expect(array[1]).toBeCloseTo(vector1.y);
      expect(array[2]).toBeCloseTo(vector2.x);
      expect(array[3]).toBeCloseTo(vector2.y);
      expect(array[4]).toBeCloseTo(vector3.x);
      expect(array[5]).toBeCloseTo(vector3.y);
    }
  });

  test('getVector', () => {
    const group = new NonAbstractPrimitiveGroup(0);

    const array = new Float32Array(6);
    {
      // Test with THREE.Vector3
      const vector1 = new THREE.Vector3(1, 2, 3);
      const vector2 = new THREE.Vector3(10, 20, 30);
      group.setVector(vector1, array, 0);
      group.setVector(vector2, array, 1);
      const target = new THREE.Vector3();
      group.getVector(array, target, 0);
      expect(target).toEqual(vector1);
      group.getVector(array, target, 1);
      expect(target).toEqual(vector2);
    }

    {
      // Test with THREE.Vector2
      const vector1 = new THREE.Vector2(1, 2);
      const vector2 = new THREE.Vector2(10, 20);
      const vector3 = new THREE.Vector2(100, 200);
      group.setVector(vector1, array, 0);
      group.setVector(vector2, array, 1);
      group.setVector(vector3, array, 2);
      const target = new THREE.Vector2();
      group.getVector(array, target, 0);
      expect(target).toEqual(vector1);
      group.getVector(array, target, 1);
      expect(target).toEqual(vector2);
      group.getVector(array, target, 2);
      expect(target).toEqual(vector3);
    }
  });

  test('setNodeId', () => {
    const group = new NonAbstractPrimitiveGroup(2);
    group.setNodeId(10, 0);
    expect(group.nodeId[0]).toBe(10);
    group.setNodeId(20, 0);
    expect(group.nodeId[0]).toBe(20);
    group.setNodeId(10, 1);
    expect(group.nodeId[0]).toBe(20);
    expect(group.nodeId[1]).toBe(10);
  });

  test('getNodeId', () => {
    const group = new NonAbstractPrimitiveGroup(2);
    group.setNodeId(10, 0);
    group.setNodeId(20, 1);
    expect(group.getNodeId(0)).toBe(10);
    expect(group.getNodeId(1)).toBe(20);
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

  test('setColor', () => {
    const group = new NonAbstractPrimitiveGroup(2);
    const color1 = new THREE.Color();
    color1.setRGB(0.1, 0.2, 0.3);
    const color2 = new THREE.Color();
    color2.setRGB(0.4, 0.5, 0.6);

    group.setColor(color1, 0);
    expect(group.color[0]).toBeCloseTo(color1.r);
    expect(group.color[1]).toBeCloseTo(color1.g);
    expect(group.color[2]).toBeCloseTo(color1.b);
    group.setColor(color2, 1);
    // Don't overwrite existing color values
    expect(group.color[0]).toBeCloseTo(color1.r);
    expect(group.color[1]).toBeCloseTo(color1.g);
    expect(group.color[2]).toBeCloseTo(color1.b);
    expect(group.color[3]).toBeCloseTo(color2.r);
    expect(group.color[4]).toBeCloseTo(color2.g);
    expect(group.color[5]).toBeCloseTo(color2.b);
  });

  test('getColor', () => {
    const group = new NonAbstractPrimitiveGroup(2);
    const color1 = new THREE.Color();
    color1.setRGB(0.1, 0.2, 0.3);
    const color2 = new THREE.Color();
    color2.setRGB(0.4, 0.5, 0.6);

    group.setColor(color1, 0);
    const target = new THREE.Color();
    group.getColor(target, 0);

    expectColorEqual(target, color1);

    group.setColor(color2, 1);
    group.getColor(target, 0);
    expectColorEqual(target, color1);
    group.getColor(target, 1);
    expectColorEqual(target, color2);
  });
});
