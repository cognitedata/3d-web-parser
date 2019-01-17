import * as THREE from 'three';
import ExtrudedRingGroup from '../geometry/ExtrudedRingGroup';

describe('ExtrudedRingGroup', () => {
  test('constructor', () => {
    const group = new ExtrudedRingGroup(2);
    expect(group.innerRadius.length).toBe(2);
    expect(group.outerRadius.length).toBe(2);
    expect(group.isClosed.length).toBe(2);
    expect(group.angle.length).toBe(2);
    expect(group.arcAngle.length).toBe(2);

    expect(ExtrudedRingGroup.type).toBe('ExtrudedRing');
  });

  test('(set/get)InnerRadius', () => {
    const group = new ExtrudedRingGroup(2);

    const radius = 1.0;
    group.setInnerRadius(radius, 0);
    expect(group.getInnerRadius(0)).toBeCloseTo(radius);
  });

  test('(set/get)OuterRadius', () => {
    const group = new ExtrudedRingGroup(2);

    const radius = 1.0;
    group.setOuterRadius(radius, 0);
    expect(group.getOuterRadius(0)).toBeCloseTo(radius);
  });

  test('(set/get)IsClosed', () => {
    const group = new ExtrudedRingGroup(2);

    group.setIsClosed(true, 0);
    expect(group.isClosed[0]).toBe(1);
    expect(group.getIsClosed(0)).toBe(true);

    group.setIsClosed(false, 0);
    expect(group.isClosed[0]).toBe(0);
    expect(group.getIsClosed(0)).toBe(false);
  });

  test('add', () => {
    const group = new ExtrudedRingGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const centerA = new THREE.Vector3(1, 2, 3);
    const centerB = new THREE.Vector3(4, 5, 6);
    const innerRadius = 100.0;
    const outerRadius = 150.0;
    const isClosed = true;
    const angle = 1.33;
    const arcAngle = 2.33;

    group.add(nodeId, treeIndex, color, centerA, centerB, innerRadius, outerRadius, isClosed, angle, arcAngle);
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

    expect(group.getInnerRadius(0)).toBeCloseTo(innerRadius);
    expect(group.getOuterRadius(0)).toBeCloseTo(outerRadius);
    expect(group.getIsClosed(0)).toBe(isClosed);
    expect(group.getAngle(0)).toBeCloseTo(angle);
    expect(group.getArcAngle(0)).toBeCloseTo(arcAngle);
  });
});
