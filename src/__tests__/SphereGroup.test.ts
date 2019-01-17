// Copyright 2019 Cognite AS

import * as THREE from 'three';
import SphereGroup from '../geometry/SphereGroup';
import { expectColorEqual, expectVector3Equal } from '../TestUtils';

describe('SphereGroup', () => {
  test('constructor', () => {
    const group = new SphereGroup(2);
    expect(group.center.length).toBe(6);
    expect(group.radius.length).toBe(2);
    expect(SphereGroup.type).toBe('Sphere');
  });

  test('(set/get)Center', () => {
    const group = new SphereGroup(2);

    const center = new THREE.Vector3(1, 2, 3);
    group.setCenter(center, 0);

    const target = new THREE.Vector3();
    group.getCenter(target, 0);
    expect(target).toEqual(center);
  });

  test('(set/get)Radius', () => {
    const group = new SphereGroup(2);

    const radius = 1.0;

    group.setRadius(radius, 0);
    expect(group.getRadius(0)).toBeCloseTo(radius);
  });

  test('add', () => {
    const group = new SphereGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const center = new THREE.Vector3(10.1, 20.5, 30.5);
    const radius = 1.5;

    group.add(nodeId, treeIndex, color, center, radius);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.getColor(targetColor, 0);
    expectColorEqual(targetColor, color);

    group.getCenter(targetVector, 0);
    expectVector3Equal(targetVector, center);

    expect(group.getRadius(0)).toBe(radius);
  });
});
