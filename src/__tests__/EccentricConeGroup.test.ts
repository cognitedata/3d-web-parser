// Copyright 2019 Cognite AS

import * as THREE from 'three';
import EccentricConeGroup from '../geometry/EccentricConeGroup';

describe('EccentricConeGroup', () => {
  test('constructor', () => {
    const group = new EccentricConeGroup(2);
    expect(group.radiusA.length).toBe(2);
    expect(group.radiusB.length).toBe(2);
    expect(group.isClosed.length).toBe(2);
    expect(group.normal.length).toBe(6);

    expect(EccentricConeGroup.type).toBe('EccentricCone');
  });

  test('(set/get)RadiusA', () => {
    const group = new EccentricConeGroup(2);

    const radius = 1.0;
    group.setRadiusA(radius, 0);
    expect(group.getRadiusA(0)).toBeCloseTo(radius);
  });

  test('(set/get)RadiusB', () => {
    const group = new EccentricConeGroup(2);

    const radius = 1.0;
    group.setRadiusB(radius, 0);
    expect(group.getRadiusB(0)).toBeCloseTo(radius);
  });

  test('(set/get)Normal', () => {
    const group = new EccentricConeGroup(2);

    // Test with THREE.Vector3
    const normal = new THREE.Vector3(1, 2, 3);
    group.setNormal(normal, 0);

    const target = new THREE.Vector3();
    group.getNormal(target, 0);
    expect(target).toEqual(normal);
  });

  test('(set/get)IsClosed', () => {
    const group = new EccentricConeGroup(2);

    group.setIsClosed(true, 0);
    expect(group.isClosed[0]).toBe(1);
    expect(group.getIsClosed(0)).toBe(true);

    group.setIsClosed(false, 0);
    expect(group.isClosed[0]).toBe(0);
    expect(group.getIsClosed(0)).toBe(false);
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
    const isClosed = true;
    const normal = new THREE.Vector3(7, 8, 9);

    group.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, normal, isClosed);
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

    group.getNormal(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(normal.x);
    expect(targetVector.y).toBeCloseTo(normal.y);
    expect(targetVector.z).toBeCloseTo(normal.z);

    expect(group.getRadiusA(0)).toBeCloseTo(radiusA);
    expect(group.getRadiusB(0)).toBeCloseTo(radiusB);
    expect(group.getIsClosed(0)).toBe(isClosed);
  });
});
