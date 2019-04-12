// Copyright 2019 Cognite AS

import * as THREE from 'three';
import NutGroup from '../geometry/NutGroup';
import { expectVector3Equal } from '../TestUtils';

describe('NutGroup', () => {
  test('constructor', () => {
    const group = new NutGroup(2);
    expect(group.hasCustomTransformAttributes).toBeFalsy();
    expect(group.type).toBe('Nut');
  });

  test('(set/get)Radius', () => {
    const group = new NutGroup(2);

    const radius = 1.0;
    group.data.setNumber('radiusA', radius, 0);
    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radius);
  });

  test('(set/get)RotationAngle', () => {
    const group = new NutGroup(2);

    const rotationAngle = 1.0;
    group.data.setNumber('rotationAngle', rotationAngle, 0);
    expect(group.data.getNumber('rotationAngle', 0)).toBeCloseTo(rotationAngle);
  });

  test('add', () => {
    const group = new NutGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const centerA = new THREE.Vector3(1, 2, 3);
    const centerB = new THREE.Vector3(4, 5, 6);
    const radius = 100.0;
    const rotationAngle = 1.2345;
    const size = Math.sqrt((2 * radius) ** 2 + centerA.distanceTo(centerB) ** 2);

    group.add(nodeId, treeIndex, size, centerA, centerB, radius, rotationAngle);
    const targetVector = new THREE.Vector3();

    expect(group.data.count).toBe(1);

    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.data.getVector3('centerA', targetVector, 0);
    expectVector3Equal(targetVector, centerA);

    group.data.getVector3('centerB', targetVector, 0);
    expectVector3Equal(targetVector, centerB);

    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radius);
    expect(group.data.getNumber('rotationAngle', 0)).toBeCloseTo(rotationAngle);
  });
});
