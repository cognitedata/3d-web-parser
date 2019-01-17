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

    // Test with THREE.Vector3
    const center1 = new THREE.Vector3(1, 2, 3);
    const center2 = new THREE.Vector3(10, 20, 30);
    group.setCenter(center1, 0);

    const target = new THREE.Vector3();
    group.getCenter(target, 0);
    expect(target).toEqual(center1);

    group.setCenter(center2, 1);
    group.getCenter(target, 0);
    expect(target).toEqual(center1);
    group.getCenter(target, 1);
    expect(target).toEqual(center2);
  });

  test('(set/get)Normal', () => {
    const group = new PlaneGroup(2);

    // Test with THREE.Vector3
    const normal1 = new THREE.Vector3(1, 2, 3);
    const normal2 = new THREE.Vector3(10, 20, 30);
    group.setNormal(normal1, 0);

    const target = new THREE.Vector3();
    group.getNormal(target, 0);
    expect(target).toEqual(normal1);

    group.setNormal(normal2, 1);
    group.getNormal(target, 0);
    expect(target).toEqual(normal1);
    group.getNormal(target, 1);
    expect(target).toEqual(normal2);
  });
});
