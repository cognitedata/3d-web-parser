// Copyright 2019 Cognite AS

import * as THREE from 'three';
import NutGroup from '../geometry/NutGroup';

describe('NutGroup', () => {
  test('constructor', () => {
    const group = new NutGroup(2);
    expect(group.radius.length).toBe(2);
    expect(group.rotationAngle.length).toBe(2);

    expect(NutGroup.type).toBe('Nut');
  });

  test('(set/get)Radius', () => {
    const group = new NutGroup(2);

    const radius = 1.0;
    group.setRadius(radius, 0);
    expect(group.getRadius(0)).toBeCloseTo(radius);
  });

  test('(set/get)RotationAngle', () => {
    const group = new NutGroup(2);

    const rotationAngle = 1.0;
    group.setRotationAngle(rotationAngle, 0);
    expect(group.getRotationAngle(0)).toBeCloseTo(rotationAngle);
  });

  test('add', () => {
    const group = new NutGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const centerA = new THREE.Vector3(1, 2, 3);
    const centerB = new THREE.Vector3(4, 5, 6);
    const radius = 100.0;
    const rotationAngle = 1.2345;

    group.add(nodeId, treeIndex, color, centerA, centerB, radius, rotationAngle);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.getColor(targetColor, 0);
    expect(targetColor.r).toBeCloseTo(color.r);
    expect(targetColor.g).toBeCloseTo(color.g);
    expect(targetColor.b).toBeCloseTo(color.b);

    group.getCenterA(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(centerA.x);
    expect(targetVector.y).toBeCloseTo(centerA.y);
    expect(targetVector.z).toBeCloseTo(centerA.z);

    group.getCenterB(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(centerB.x);
    expect(targetVector.y).toBeCloseTo(centerB.y);
    expect(targetVector.z).toBeCloseTo(centerB.z);

    expect(group.getRadius(0)).toBeCloseTo(radius);
    expect(group.getRotationAngle(0)).toBeCloseTo(rotationAngle);
  });
});
