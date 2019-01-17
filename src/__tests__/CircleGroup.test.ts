// Copyright 2019 Cognite AS

import * as THREE from 'three';
import CircleGroup from '../geometry/CircleGroup';
import { expectColorEqual, expectVector3Equal } from '../TestUtils';

describe('CircleGroup', () => {
  test('constructor', () => {
    const group = new CircleGroup(2);
    expect(group.radius.length).toBe(2);
    expect(CircleGroup.type).toBe('Circle');
  });

  test('(set/get)Radius', () => {
    const group = new CircleGroup(2);

    const radius = 1.0;

    group.setRadius(radius, 0);
    expect(group.getRadius(0)).toBeCloseTo(radius);
  });

  test('add', () => {
    const group = new CircleGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const center = new THREE.Vector3(1, 2, 3);
    const normal = new THREE.Vector3(4, 5, 6);
    const radius = 10.0;

    group.add(nodeId, treeIndex, color, center, normal, radius);
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

    expect(group.getRadius(0)).toBeCloseTo(radius);
  });
});
