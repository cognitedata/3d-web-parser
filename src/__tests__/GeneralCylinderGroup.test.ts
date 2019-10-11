// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeneralCylinderGroup from '../geometry/GeneralCylinderGroup';
import { expectVector3Equal } from '../TestUtils';

describe('GeneralCylinderGroup', () => {
  test('constructor', () => {
    const group = new GeneralCylinderGroup(2);
    expect(group.hasCustomTransformAttributes).toBeTruthy();

    expect(group.type).toBe('GeneralCylinder');
  });

  test('(set/get)Angle', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.data.setNumber('angle', value, 0);
    expect(group.data.getNumber('angle', 0)).toBeCloseTo(value);
  });

  test('(set/get)ArcAngle', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.data.setNumber('arcAngle', value, 0);
    expect(group.data.getNumber('arcAngle', 0)).toBeCloseTo(value);
  });

  test('(set/get)HeightA', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.data.setNumber('heightA', value, 0);
    expect(group.data.getNumber('heightA', 0)).toBeCloseTo(value);
  });

  test('(set/get)HeightB', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.data.setNumber('heightB', value, 0);
    expect(group.data.getNumber('heightB', 0)).toBeCloseTo(value);
  });

  test('(set/get)SlopeA', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.data.setNumber('slopeA', value, 0);
    expect(group.data.getNumber('slopeA', 0)).toBeCloseTo(value);
  });

  test('(set/get)SlopeB', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.data.setNumber('slopeB', value, 0);
    expect(group.data.getNumber('slopeB', 0)).toBeCloseTo(value);
  });

  test('(set/get)ZAngleA', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.data.setNumber('zAngleA', value, 0);
    expect(group.data.getNumber('zAngleA', 0)).toBeCloseTo(value);
  });

  test('(set/get)ZAngleB', () => {
    const group = new GeneralCylinderGroup(2);

    const value = 1.0;
    group.data.setNumber('zAngleB', value, 0);
    expect(group.data.getNumber('zAngleB', 0)).toBeCloseTo(value);
  });

  test('add', () => {
    const group = new GeneralCylinderGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
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
    const size = Math.sqrt((2 * radius) ** 2 + centerA.distanceTo(centerB) ** 2);

    group.add(
      nodeId,
      treeIndex,
      size,
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
      arcAngle
    );
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.data.count).toBe(1);

    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.data.getVector3('centerA', targetVector, 0);
    expectVector3Equal(targetVector, centerA);

    group.data.getVector3('centerB', targetVector, 0);
    expectVector3Equal(targetVector, centerB);

    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radius);
    expect(group.data.getNumber('heightA', 0)).toBeCloseTo(heightA);
    expect(group.data.getNumber('heightB', 0)).toBeCloseTo(heightB);
    expect(group.data.getNumber('slopeA', 0)).toBeCloseTo(slopeA);
    expect(group.data.getNumber('slopeB', 0)).toBeCloseTo(slopeB);
    expect(group.data.getNumber('zAngleA', 0)).toBeCloseTo(zAngleA);
    expect(group.data.getNumber('zAngleB', 0)).toBeCloseTo(zAngleB);
    expect(group.data.getNumber('angle', 0)).toBeCloseTo(angle);
    expect(group.data.getNumber('arcAngle', 0)).toBeCloseTo(arcAngle);
  });

  test(`add() maps angle input angle to range [-PI, PI] (RJ3D-460)`, () => {
    const testCases: { inputAngle: number; expectedOutputAngle: number }[] = [
      { inputAngle: 0.0, expectedOutputAngle: 0.0 },
      { inputAngle: 1.0, expectedOutputAngle: 1.0 },
      { inputAngle: -Math.PI / 2, expectedOutputAngle: -Math.PI / 2 },
      { inputAngle: Math.PI + 0.2, expectedOutputAngle: -Math.PI + 0.2 },
      { inputAngle: 2 * Math.PI, expectedOutputAngle: 0.0 },
      { inputAngle: Math.PI, expectedOutputAngle: Math.PI },
      { inputAngle: -Math.PI, expectedOutputAngle: -Math.PI }
    ];
    const nodeId = 1;
    const treeIndex = 1;
    const centerA = new THREE.Vector3(1, 2, 3);
    const centerB = new THREE.Vector3(4, 5, 6);
    const radius = 1.1;
    const heightA = 2.1;
    const heightB = 3.1;
    const slopeA = 4.1;
    const slopeB = 5.1;
    const zAngleA = 6.1;
    const zAngleB = 7.1;
    const arcAngle = 1.05;
    const size = Math.sqrt((2 * radius) ** 2 + centerA.distanceTo(centerB) ** 2);

    for (const testCase of testCases) {
      const group = new GeneralCylinderGroup(10);
      group.add(
        nodeId,
        treeIndex,
        size,
        centerA,
        centerB,
        radius,
        heightA,
        heightB,
        slopeA,
        slopeB,
        zAngleA,
        zAngleB,
        testCase.inputAngle,
        arcAngle
      );
      group.setupAttributes();
      const attributeIdx = group.attributes.findIndex(x => x.name === 'a_angle');

      const dataOutputAngle = group.data.getNumber('angle', 0);
      const attributeOutputAngle = group.attributes[attributeIdx].array[0];

      expect(dataOutputAngle).toBeCloseTo(testCase.expectedOutputAngle);
      expect(attributeOutputAngle).toBeCloseTo(testCase.expectedOutputAngle);
    }
  });
});
