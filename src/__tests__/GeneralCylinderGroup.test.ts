// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeneralCylinderGroup from '../geometry/GeneralCylinderGroup';

describe('GeneralCylinderGroup', () => {
  test('constructor', () => {
    const group = new GeneralCylinderGroup(2);
    expect(group.angle.length).toBe(2);
    expect(group.arcAngle.length).toBe(2);
    expect(group.caps.length).toBe(4);
    expect(group.heightA.length).toBe(2);
    expect(group.heightB.length).toBe(2);
    expect(group.slopeA.length).toBe(2);
    expect(group.slopeB.length).toBe(2);
    expect(group.zAngleA.length).toBe(2);
    expect(group.zAngleB.length).toBe(2);
    expect(GeneralCylinderGroup.type).toBe('GeneralCylinder');
  });

  test('(set/get)Angle', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.setAngle(value, 0);
    expect(group.getAngle(0)).toBeCloseTo(value);
  });

  test('(set/get)ArcAngle', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.setArcAngle(value, 0);
    expect(group.getArcAngle(0)).toBeCloseTo(value);
  });

  test('(set/get)HeightA', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.setHeightA(value, 0);
    expect(group.getHeightA(0)).toBeCloseTo(value);
  });

  test('(set/get)HeightB', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.setHeightB(value, 0);
    expect(group.getHeightB(0)).toBeCloseTo(value);
  });

  test('(set/get)SlopeA', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.setSlopeA(value, 0);
    expect(group.getSlopeA(0)).toBeCloseTo(value);
  });

  test('(set/get)SlopeB', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.setSlopeB(value, 0);
    expect(group.getSlopeB(0)).toBeCloseTo(value);
  });

  test('(set/get)ZAngleA', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.setZAngleA(value, 0);
    expect(group.getZAngleA(0)).toBeCloseTo(value);
  });

  test('(set/get)ZAngleB', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.setZAngleB(value, 0);
    expect(group.getZAngleB(0)).toBeCloseTo(value);
  });

  test('add', () => {
    const group = new GeneralCylinderGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const centerA = new THREE.Vector3(1, 2, 3);
    const centerB = new THREE.Vector3(4, 5, 6);
    const radius = 1.1;
    const heightA = 2.1;
    const heightB = 3.1;
    const slopeA = 4.1;
    const slopeB = 5.1;
    const zAngleA = 6.1;
    const zAngleB = 7.1;
    const angle = 1.3;
    const arcAngle = 1.05;

    group.add(
      nodeId,
      treeIndex,
      color,
      centerA,
      centerB,
      radius,
      heightA,
      heightB,
      slopeA,
      slopeB,
      zAngleA,
      zAngleB,
      angle,
      arcAngle);
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
    expect(group.getHeightA(0)).toBeCloseTo(heightA);
    expect(group.getHeightB(0)).toBeCloseTo(heightB);
    expect(group.getSlopeA(0)).toBeCloseTo(slopeA);
    expect(group.getSlopeB(0)).toBeCloseTo(slopeB);
    expect(group.getZAngleA(0)).toBeCloseTo(zAngleA);
    expect(group.getZAngleB(0)).toBeCloseTo(zAngleB);
    expect(group.getAngle(0)).toBeCloseTo(angle);
    expect(group.getArcAngle(0)).toBeCloseTo(arcAngle);
  });
});
