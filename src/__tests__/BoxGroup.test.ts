// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BoxGroup from '../geometry/BoxGroup';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';

describe('BoxGroup', () => {
  test('constructor', () => {
    const group = new BoxGroup(2);
    expect(group.angle.length).toBe(2);
    expect(group.delta.length).toBe(6);
    expect(BoxGroup.type).toBe('Box');
  });

  test('(set/get)Angle', () => {
    const group = new BoxGroup(2);

    const angle1 = 1.0;
    const angle2 = 10.0;

    group.setAngle(angle1, 0);
    expect(group.getAngle(0)).toBeCloseTo(angle1);

    group.setAngle(angle2, 1);
    expect(group.getAngle(0)).toBeCloseTo(angle1);
    expect(group.getAngle(1)).toBeCloseTo(angle2);
  });

  test('(set/get)Delta', () => {
    const group = new BoxGroup(1);

    const delta = new THREE.Vector3(1, 2, 3);
    const target = new THREE.Vector3();

    group.setDelta(delta, 0);
    expect(group.getDelta(target, 0)).toEqual(delta);
  });

  test('add', () => {
    const group = new BoxGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const center = new THREE.Vector3(1, 2, 3);
    const normal = new THREE.Vector3(4, 5, 6);
    const angle = 10.0;
    const delta = new THREE.Vector3(10, 10, 10);

    group.add(nodeId, treeIndex, color, center, normal, angle, delta);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.getColor(targetColor, 0);
    expectColorEqual(targetColor, color);

    group.getCenter(targetVector, 0);
    expectVector3Equal(targetVector, center);

    group.getNormal(targetVector, 0);
    expectVector3Equal(targetVector, normal);

    expect(group.getAngle(0)).toBeCloseTo(angle);

    group.getDelta(targetVector, 0);
    expectVector3Equal(targetVector, delta);
  });
});
