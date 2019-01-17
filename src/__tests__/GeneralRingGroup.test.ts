// Copyright 2019 Cognite AS

import * as THREE from 'three';
import GeneralRingGroup from '../geometry/GeneralRingGroup';

describe('GeneralRingGroup', () => {
  test('constructor', () => {
    const group = new GeneralRingGroup(2);
    expect(group.xRadius.length).toBe(2);
    expect(group.yRadius.length).toBe(2);
    expect(group.localXAxis.length).toBe(6);
    expect(group.thickness.length).toBe(2);
    expect(group.angle.length).toBe(2);
    expect(group.arcAngle.length).toBe(2);
    expect(GeneralRingGroup.type).toBe('GeneralRing');
  });

  test('(set/get)XRadius', () => {
    const group = new GeneralRingGroup(2);
    const radius = 1.0;
    group.setXRadius(radius, 0);
    expect(group.getXRadius(0)).toBeCloseTo(radius);
  });

  test('(set/get)XRadius', () => {
    const group = new GeneralRingGroup(2);
    const radius = 1.0;
    group.setYRadius(radius, 0);
    expect(group.getYRadius(0)).toBeCloseTo(radius);
  });

  test('(set/get)LocalXAxis', () => {
    const group = new GeneralRingGroup(2);
    const localXAxis = new THREE.Vector3(1, 2, 3);
    const target = new THREE.Vector3();

    group.setLocalXAxis(localXAxis, 0);
    group.getLocalXAxis(target, 0);
    expect(target.x).toBeCloseTo(localXAxis.x);
    expect(target.y).toBeCloseTo(localXAxis.y);
    expect(target.z).toBeCloseTo(localXAxis.z);
  });

  test('(set/get)Thickness', () => {
    const group = new GeneralRingGroup(2);
    const thickness = 1.0;
    group.setThickness(thickness, 0);
    expect(group.getThickness(0)).toBeCloseTo(thickness);
  });

  test('(set/get)Angle', () => {
    const group = new GeneralRingGroup(2);
    const angle = 1.0;
    group.setAngle(angle, 0);
    expect(group.getAngle(0)).toBeCloseTo(angle);
  });

  test('(set/get)ArcAngle', () => {
    const group = new GeneralRingGroup(2);
    const arcAngle = 1.0;
    group.setArcAngle(arcAngle, 0);
    expect(group.getArcAngle(0)).toBeCloseTo(arcAngle);
  });

  test('add', () => {
    const group = new GeneralRingGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const center = new THREE.Vector3(1, 2, 3);
    const normal = new THREE.Vector3(4, 5, 6);
    const xRadius = 1.0;
    const yRadius = 2.0;
    const localXAxis = new THREE.Vector3(10, 20, 30);
    const thickness = 3.0;
    const angle = 4.0;
    const arcAngle = 5.0;

    group.add(nodeId, treeIndex, color, center, normal, xRadius, yRadius, localXAxis, thickness, angle, arcAngle);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.getColor(targetColor, 0);
    expect(targetColor.r).toBeCloseTo(color.r);
    expect(targetColor.g).toBeCloseTo(color.g);
    expect(targetColor.b).toBeCloseTo(color.b);

    group.getCenter(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(center.x);
    expect(targetVector.y).toBeCloseTo(center.y);
    expect(targetVector.z).toBeCloseTo(center.z);

    group.getNormal(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(normal.x);
    expect(targetVector.y).toBeCloseTo(normal.y);
    expect(targetVector.z).toBeCloseTo(normal.z);

    expect(group.getXRadius(0)).toBeCloseTo(xRadius);
    expect(group.getYRadius(0)).toBeCloseTo(yRadius);

    group.getLocalXAxis(targetVector, 0);
    expect(targetVector.x).toBeCloseTo(localXAxis.x);
    expect(targetVector.y).toBeCloseTo(localXAxis.y);
    expect(targetVector.z).toBeCloseTo(localXAxis.z);

    expect(group.getThickness(0)).toBeCloseTo(thickness);
    expect(group.getAngle(0)).toBeCloseTo(angle);
    expect(group.getArcAngle(0)).toBeCloseTo(arcAngle);
  });
});
