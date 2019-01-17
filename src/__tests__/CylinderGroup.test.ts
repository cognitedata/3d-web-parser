// Copyright 2019 Cognite AS

import * as THREE from 'three';
import CylinderGroup from '../geometry/CylinderGroup';
import { expectColorEqual, expectVector3Equal } from '../TestUtils';

describe('CylinderGroup', () => {
  test('constructor', () => {
    const group = new CylinderGroup(2);
    expect(group.radius.length).toBe(2);
    expect(group.isClosed.length).toBe(2);
    expect(CylinderGroup.type).toBe('Cylinder');
  });

  test('(set/get)Radius', () => {
    const group = new CylinderGroup(2);

    const radius = 1.0;
    group.setRadius(radius, 0);
    expect(group.getRadius(0)).toBeCloseTo(radius);
  });

  test('(set/get)IsClosed', () => {
    const group = new CylinderGroup(2);

    group.setIsClosed(true, 0);
    expect(group.isClosed[0]).toBe(1);
    expect(group.getIsClosed(0)).toBe(true);

    group.setIsClosed(false, 0);
    expect(group.isClosed[0]).toBe(0);
    expect(group.getIsClosed(0)).toBe(false);
  });

  test('add', () => {
    const group = new CylinderGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const centerA = new THREE.Vector3(1, 2, 3);
    const centerB = new THREE.Vector3(4, 5, 6);
    const radius = 100.0;
    const isClosed = true;

    group.add(nodeId, treeIndex, color, centerA, centerB, radius, isClosed);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.getColor(targetColor, 0);
    expectColorEqual(targetColor, color);

    group.getCenterA(targetVector, 0);
    expectVector3Equal(targetVector, centerA);

    group.getCenterB(targetVector, 0);
    expectVector3Equal(targetVector, centerB);

    expect(group.getRadius(0)).toBeCloseTo(radius);
    expect(group.getIsClosed(0)).toBe(isClosed);
  });
});
