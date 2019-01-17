// Copyright 2019 Cognite AS

import * as THREE from 'three';
import PlaneGroup from '../geometry/PlaneGroup';

describe('PlaneGroup', () => {
  test('constructor', () => {
    const group = new PlaneGroup(2);
    expect(group.center.length).toBe(6);
    expect(group.normal.length).toBe(6);
  });

  test('(set/get)Center', () => {
    const group = new PlaneGroup(2);

    const center = new THREE.Vector3(1, 2, 3);
    group.setCenter(center, 0);

    const target = new THREE.Vector3();
    group.getCenter(target, 0);
    expect(target).toEqual(center);
  });

  test('(set/get)Normal', () => {
    const group = new PlaneGroup(2);

    const normal = new THREE.Vector3(1, 2, 3);
    group.setNormal(normal, 0);

    const target = new THREE.Vector3();
    group.getNormal(target, 0);
    expect(target).toEqual(normal);
  });
});
