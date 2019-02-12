// Copyright 2019 Cognite AS

import * as THREE from 'three';
import EccentricConeGroup from '../geometry/EccentricConeGroup';
import { expectColorEqual, expectVector3Equal } from '../TestUtils';

describe('EccentricConeGroup', () => {
  test('constructor', () => {
    const group = new EccentricConeGroup(2);
    expect(group.hasCustomTransformAttributes).toBeTruthy();
    expect(group.type).toBe('EccentricCone');
  });

  test('(set/get)RadiusA', () => {
    const group = new EccentricConeGroup(2);

    const radius = 1.0;
    group.data.setNumber('radiusA', radius, 0);
    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radius);
  });

  test('(set/get)RadiusB', () => {
    const group = new EccentricConeGroup(2);

    const radius = 1.0;
    group.data.setNumber('radiusB', radius, 0);
    expect(group.data.getNumber('radiusB', 0)).toBeCloseTo(radius);
  });

  test('(set/get)Normal', () => {
    const group = new EccentricConeGroup(2);

    // Test with THREE.Vector3
    const normal = new THREE.Vector3(1, 2, 3);
    group.data.setVector3('normal', normal, 0);

    const target = new THREE.Vector3();
    group.data.getVector3('normal', target, 0);
    expect(target).toEqual(normal);
  });

  test('add', () => {
    const group = new EccentricConeGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const centerA = new THREE.Vector3(1, 2, 3);
    const centerB = new THREE.Vector3(4, 5, 6);
    const radiusA = 100.0;
    const radiusB = 150.0;
    const normal = new THREE.Vector3(7, 8, 9);

    group.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, normal);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.data.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.getColor(targetColor, 0);
    expectColorEqual(targetColor, color);

    group.data.getVector3('centerA', targetVector, 0);
    expectVector3Equal(targetVector, centerA);

    group.data.getVector3('centerB', targetVector, 0);
    expectVector3Equal(targetVector, centerB);

    group.data.getVector3('normal', targetVector, 0);
    expectVector3Equal(targetVector, normal);

    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radiusA);
    expect(group.data.getNumber('radiusB', 0)).toBeCloseTo(radiusB);
  });
});
