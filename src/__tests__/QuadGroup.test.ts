// Copyright 2019 Cognite AS

import * as THREE from 'three';
import QuadGroup from '../geometry/QuadGroup';
import { expectVector3Equal } from '../TestUtils';

describe('QuadGroup', () => {
  test('constructor', () => {
    const group = new QuadGroup(2);
    expect(group.hasCustomTransformAttributes).toBeFalsy();
    expect(group.type).toBe('Quad');
  });

  test('(set/get)Vertex1', () => {
    const group = new QuadGroup(2);

    const vertex = new THREE.Vector3(1, 2, 3);
    group.data.setVector3('vertex1', vertex, 0);

    const target = new THREE.Vector3();
    group.data.getVector3('vertex1', target, 0);
    expect(target).toEqual(vertex);
  });

  test('(set/get)Vertex2', () => {
    const group = new QuadGroup(2);

    const vertex = new THREE.Vector3(1, 2, 3);
    group.data.setVector3('vertex2', vertex, 0);

    const target = new THREE.Vector3();
    group.data.getVector3('vertex2', target, 0);
    expect(target).toEqual(vertex);
  });

  test('(set/get)Vertex3', () => {
    const group = new QuadGroup(2);

    const vertex = new THREE.Vector3(1, 2, 3);
    group.data.setVector3('vertex3', vertex, 0);

    const target = new THREE.Vector3();
    group.data.getVector3('vertex3', target, 0);
    expect(target).toEqual(vertex);
  });

  test('add', () => {
    const group = new QuadGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const vertex1 = new THREE.Vector3(10.1, 20.5, 30.5);
    const vertex2 = new THREE.Vector3(10.112, 21.5, 40.5);
    const vertex3 = new THREE.Vector3(5.1, 221.5, 33.5);
    const size = vertex1.distanceTo(vertex3);

    group.add(nodeId, treeIndex, size, vertex1, vertex2, vertex3);
    const targetVector = new THREE.Vector3();

    expect(group.data.count).toBe(1);

    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.data.getVector3('vertex1', targetVector, 0);
    expectVector3Equal(targetVector, vertex1);

    group.data.getVector3('vertex2', targetVector, 0);
    expectVector3Equal(targetVector, vertex2);

    group.data.getVector3('vertex3', targetVector, 0);
    expectVector3Equal(targetVector, vertex3);
  });
});
