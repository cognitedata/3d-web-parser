// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeneralRingGroup from '../geometry/GeneralRingGroup';
import { expectVector3Equal } from '../TestUtils';

describe('GeneralRingGroup', () => {
  test('constructor', () => {
    const group = new GeneralRingGroup(2);
    expect(group.hasCustomTransformAttributes).toBeFalsy();
    expect(group.type).toBe('GeneralRing');
  });

  test('(set/get)XRadius', () => {
    const group = new GeneralRingGroup(2);
    const radius = 1.0;
    group.data.setNumber('radiusA', radius, 0);
    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radius);
  });

  test('(set/get)XRadius', () => {
    const group = new GeneralRingGroup(2);
    const radius = 1.0;
    group.data.setNumber('radiusB', radius, 0);
    expect(group.data.getNumber('radiusB', 0)).toBeCloseTo(radius);
  });

  test('(set/get)LocalXAxis', () => {
    const group = new GeneralRingGroup(2);
    const localXAxis = new THREE.Vector3(1, 2, 3);
    const target = new THREE.Vector3();

    group.data.setVector3('localXAxis', localXAxis, 0);
    group.data.getVector3('localXAxis', target, 0);
    expect(target.x).toBeCloseTo(localXAxis.x);
    expect(target.y).toBeCloseTo(localXAxis.y);
    expect(target.z).toBeCloseTo(localXAxis.z);
  });

  test('(set/get)Thickness', () => {
    const group = new GeneralRingGroup(2);
    const thickness = 1.0;
    group.data.setNumber('thickness', thickness, 0);
    expect(group.data.getNumber('thickness', 0)).toBeCloseTo(thickness);
  });

  test('(set/get)Angle', () => {
    const group = new GeneralRingGroup(2);
    const angle = 1.0;
    group.data.setNumber('angle', angle, 0);
    expect(group.data.getNumber('angle', 0)).toBeCloseTo(angle);
  });

  test('(set/get)ArcAngle', () => {
    const group = new GeneralRingGroup(2);
    const arcAngle = 1.0;
    group.data.setNumber('arcAngle', arcAngle, 0);
    expect(group.data.getNumber('arcAngle', 0)).toBeCloseTo(arcAngle);
  });

  test('add', () => {
    const group = new GeneralRingGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const center = new THREE.Vector3(1, 2, 3);
    const normal = new THREE.Vector3(4, 5, 6);
    const xRadius = 1.0;
    const yRadius = 2.0;
    const localXAxis = new THREE.Vector3(10, 20, 30);
    const thickness = 3.0;
    const angle = (3.0 * Math.PI) / 4.0;
    const arcAngle = 5.0;
    const size = Math.sqrt((2 * yRadius) ** 2 + 2 * yRadius);

    group.add(nodeId, treeIndex, size, center, normal, localXAxis, xRadius, yRadius, thickness, angle, arcAngle);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.data.count).toBe(1);

    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.data.getVector3('center', targetVector, 0);
    expectVector3Equal(targetVector, center);

    group.data.getVector3('normal', targetVector, 0);
    expectVector3Equal(targetVector, normal);

    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(xRadius);
    expect(group.data.getNumber('radiusB', 0)).toBeCloseTo(yRadius);

    group.data.getVector3('localXAxis', targetVector, 0);
    expectVector3Equal(targetVector, localXAxis);

    expect(group.data.getNumber('thickness', 0)).toBeCloseTo(thickness / yRadius);
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

    for (const testCase of testCases) {
      const group = new GeneralRingGroup(10);
      group.add(
        1,
        1,
        1.0,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1, 0),
        10.0,
        5.0,
        1.0,
        testCase.inputAngle,
        Math.PI / 4
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
