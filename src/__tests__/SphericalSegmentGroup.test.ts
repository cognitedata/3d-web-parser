// Copyright 2019 Cognite AS

import * as THREE from 'three';
import SphericalSegmentGroup from '../geometry/SphericalSegmentGroup';
import { expectColorEqual, expectVector3Equal } from '../TestUtils';

describe('SphericalSegmentGroup', () => {
  test('constructor', () => {
    const group = new SphericalSegmentGroup(2);
    expect(group.hasCustomTransformAttributes).toBeTruthy();
    expect(group.type).toBe('SphericalSegment');
  });

  test('(set/get)Center', () => {
    const group = new SphericalSegmentGroup(2);

    const center = new THREE.Vector3(1.1, 2.1, 3.1);
    group.data.setVector3('centerA',  center, 0);

    expectVector3Equal(group.data.getVector3('centerA', new THREE.Vector3(), 0), center);
  });

  test('(set/get)Normal', () => {
    const group = new SphericalSegmentGroup(2);

    const normal = new THREE.Vector3(1.1, 2.1, 3.1);
    group.data.setVector3('normal', normal, 0);

    expectVector3Equal(group.data.getVector3('normal', new THREE.Vector3(), 0), normal);
  });

  test('(set/get)Radius', () => {
    const group = new SphericalSegmentGroup(2);

    const radius = 1.0;

    group.data.setNumber('radiusA', radius, 0);
    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radius);
  });

  test('(set/get)Height', () => {
    const group = new SphericalSegmentGroup(2);

    const height = 1.0;

    group.data.setNumber('heightA', height, 0);
    expect(group.data.getNumber('heightA', 0)).toBeCloseTo(height);
  });

  test('add', () => {
    const group = new SphericalSegmentGroup(2);

    const nodeId = 1;
    const treeIndex = 2;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const center = new THREE.Vector3(10.1, 20.5, 30.5);
    const normal = new THREE.Vector3(0.1, 0.2, 0.3);
    const radius = 1.5;
    const height = 1.1;

    group.add(nodeId, treeIndex, color, center, normal, radius, height);

    expect(group.data.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    expectVector3Equal(group.data.getVector3('normal', new THREE.Vector3(), 0), normal);
    expectVector3Equal(group.data.getVector3('centerA', new THREE.Vector3(), 0), center);

    expect(group.data.getNumber('radiusA', 0)).toBeCloseTo(radius);
    expect(group.data.getNumber('heightA', 0)).toBeCloseTo(height);
  });
});
