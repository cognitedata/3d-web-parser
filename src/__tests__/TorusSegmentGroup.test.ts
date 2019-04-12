// Copyright 2019 Cognite AS

import * as THREE from 'three';
import TorusSegmentGroup from '../geometry/TorusSegmentGroup';
import { expectVector3Equal } from '../TestUtils';

describe('TorusSegmentGroup', () => {
  test('constructor', () => {
    const group = new TorusSegmentGroup(2);
    expect(group.hasCustomTransformAttributes).toBeFalsy();
    expect(group.type).toBe('TorusSegment');
  });

  test('(set/get)Radius', () => {
    const group = new TorusSegmentGroup(2);

    const radius = 1.0;

    group.data.setNumber('radius', radius, 0);
    expect(group.data.getNumber('radius', 0)).toBeCloseTo(radius);
  });

  test('(set/get)TubeRadius', () => {
    const group = new TorusSegmentGroup(2);

    const tubeRadius = 1.0;

    group.data.setNumber('tubeRadius', tubeRadius, 0);
    expect(group.data.getNumber('tubeRadius', 0)).toBeCloseTo(tubeRadius);
  });

  test('(set/get)Angle', () => {
    const group = new TorusSegmentGroup(2);

    const angle = 1.0;

    group.data.setNumber('angle',  angle, 0);
    expect(group.data.getNumber('angle',  0)).toBeCloseTo(angle);
  });

  test('(set/get)ArcAngle', () => {
    const group = new TorusSegmentGroup(2);

    const arcAngle = 1.0;

    group.data.setNumber('arcAngle',  arcAngle, 0);
    expect(group.data.getNumber('arcAngle',  0)).toBeCloseTo(arcAngle);
  });

  test('add', () => {
    const group = new TorusSegmentGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const center = new THREE.Vector3(10.1, 20.5, 30.5);
    const normal = new THREE.Vector3(0.1, 0.2, 0.3);
    const radius = 1.2;
    const tubeRadius = 1.3;
    const angle = 1.4;
    const arcAngle = 1.5;

    const size = Math.sqrt((2 * radius) ** 2 + (2 * tubeRadius) ** 2);

    group.add(nodeId, treeIndex, size, center, normal, radius, tubeRadius, angle, arcAngle);

    expect(group.data.count).toBe(1);

    expect(group.getTreeIndex(0)).toBe(treeIndex);

    expectVector3Equal(group.data.getVector3('center', new THREE.Vector3(), 0), center);

    expect(group.data.getNumber('radius', 0)).toBeCloseTo(radius);
    expect(group.data.getNumber('tubeRadius', 0)).toBeCloseTo(tubeRadius);
    expect(group.data.getNumber('angle',  0)).toBeCloseTo(angle);
    expect(group.data.getNumber('arcAngle',  0)).toBeCloseTo(arcAngle);
  });
});
