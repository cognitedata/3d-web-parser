// Copyright 2019 Cognite AS

import * as THREE from 'three';
import ConeGroup from '../geometry/ConeGroup';
import { expectColorEqual, expectVector3Equal } from '../TestUtils';

describe('ConeGroup', () => {
  test('constructor', () => {
    const group = new ConeGroup(2);
    expect(group.radiusA.length).toBe(2);
    expect(group.radiusB.length).toBe(2);
    expect(group.angle.length).toBe(2);
    expect(group.arcAngle.length).toBe(2);

    expect(ConeGroup.type).toBe('Cone');
  });

  test('(set/get)RadiusA', () => {
    const group = new ConeGroup(2);

    const radius = 1.0;
    group.setRadiusA(radius, 0);
    expect(group.getRadiusA(0)).toBeCloseTo(radius);
  });

  test('(set/get)RadiusB', () => {
    const group = new ConeGroup(2);

    const radius = 1.0;
    group.setRadiusB(radius, 0);
    expect(group.getRadiusB(0)).toBeCloseTo(radius);
  });

  test('add', () => {
    const group = new ConeGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const centerA = new THREE.Vector3(1, 2, 3);
    const centerB = new THREE.Vector3(4, 5, 6);
    const radiusA = 100.0;
    const radiusB = 150.0;
    const angle = 1.33;
    const arcAngle = 2.33;

    group.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, angle, arcAngle);
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

    expect(group.getRadiusA(0)).toBeCloseTo(radiusA);
    expect(group.getRadiusB(0)).toBeCloseTo(radiusB);
    expect(group.getAngle(0)).toBeCloseTo(angle);
    expect(group.getArcAngle(0)).toBeCloseTo(arcAngle);
  });
});
