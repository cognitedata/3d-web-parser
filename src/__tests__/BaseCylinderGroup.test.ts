import * as THREE from 'three';
import BaseCylinderGroup from '../geometry/BaseCylinderGroup';
class NonAbstractBaseCylinderGroup extends BaseCylinderGroup {}

describe('CylinderGroup', () => {
  test('constructor', () => {
    const group = new NonAbstractBaseCylinderGroup(2);
    expect(group.centerA.length).toBe(6);
    expect(group.centerB.length).toBe(6);
  });

  test('(set/get)CenterA', () => {
    const group = new NonAbstractBaseCylinderGroup(2);

    const center = new THREE.Vector3(1, 2, 3);
    const target = new THREE.Vector3();
    group.setCenterA(center, 0);
    group.getCenterA(target, 0);
    expect(target.x).toBeCloseTo(center.x);
    expect(target.y).toBeCloseTo(center.y);
    expect(target.z).toBeCloseTo(center.z);
  });

  test('(set/get)CenterB', () => {
    const group = new NonAbstractBaseCylinderGroup(2);

    const center = new THREE.Vector3(1, 2, 3);
    const target = new THREE.Vector3();
    group.setCenterB(center, 0);
    group.getCenterB(target, 0);
    expect(target.x).toBeCloseTo(center.x);
    expect(target.y).toBeCloseTo(center.y);
    expect(target.z).toBeCloseTo(center.z);
  });
});
