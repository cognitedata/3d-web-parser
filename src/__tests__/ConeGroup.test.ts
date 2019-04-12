// Copyright 2019 Cognite AS

import * as THREE from 'three';
import ConeGroup from '../geometry/ConeGroup';
import { expectVector3Equal } from '../TestUtils';

describe('ConeGroup', () => {
  test('constructor', () => {
    const group = new ConeGroup(2);
    expect(group.hasCustomTransformAttributes).toBeTruthy();
    expect(group.type).toBe('Cone');
  });

  test('(set/get)RadiusA', () => {
    const group = new ConeGroup(2);

    const radius = 1.0;
    group.data.setNumber('radiusA', radius, 0);
    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radius);
  });

  test('(set/get)RadiusB', () => {
    const group = new ConeGroup(2);

    const radius = 1.0;
    group.data.setNumber('radiusB', radius, 0);
    expect(group.data.getNumber('radiusB', 0)).toBeCloseTo(radius);
  });

  test('add', () => {
    const group = new ConeGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const centerA = new THREE.Vector3(1, 2, 3);
    const centerB = new THREE.Vector3(4, 5, 6);
    const radiusA = 100.0;
    const radiusB = 150.0;
    const angle = 1.33;
    const arcAngle = 2.33;
    const size = Math.sqrt((2 * radiusB) ** 2 + centerA.distanceTo(centerB) ** 2);

    group.add(nodeId, treeIndex, size, centerA, centerB, radiusA, radiusB, angle, arcAngle);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.data.count).toBe(1);

    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.data.getVector3('centerA', targetVector, 0);
    expectVector3Equal(targetVector, centerA);

    group.data.getVector3('centerB', targetVector, 0);
    expectVector3Equal(targetVector, centerB);

    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radiusA);
    expect(group.data.getNumber('radiusB', 0)).toBeCloseTo(radiusB);
    expect(group.data.getNumber('angle', 0)).toBeCloseTo(angle);
    expect(group.data.getNumber('arcAngle', 0)).toBeCloseTo(arcAngle);
  });
});
