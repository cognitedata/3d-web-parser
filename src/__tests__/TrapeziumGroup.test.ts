// Copyright 2019 Cognite AS

import * as THREE from 'three';
import TrapeziumGroup from '../geometry/TrapeziumGroup';
import { expectColorEqual, expectVector3Equal } from '../TestUtils';

describe('TrapeziumGroup', () => {
  test('constructor', () => {
    const group = new TrapeziumGroup(2);
    expect(group.vertex1.length).toBe(6);
    expect(group.vertex2.length).toBe(6);
    expect(group.vertex3.length).toBe(6);
    expect(group.vertex4.length).toBe(6);
    expect(TrapeziumGroup.type).toBe('Trapezium');
  });

  test('(set/get)Vertex1', () => {
    const group = new TrapeziumGroup(2);

    const vertex = new THREE.Vector3(1, 2, 3);
    group.setVertex1(vertex, 0);

    const target = new THREE.Vector3();
    group.getVertex1(target, 0);
    expect(target).toEqual(vertex);
  });

  test('(set/get)Vertex2', () => {
    const group = new TrapeziumGroup(2);

    const vertex = new THREE.Vector3(1, 2, 3);
    group.setVertex2(vertex, 0);

    const target = new THREE.Vector3();
    group.getVertex2(target, 0);
    expect(target).toEqual(vertex);
  });

  test('(set/get)Vertex3', () => {
    const group = new TrapeziumGroup(2);

    const vertex = new THREE.Vector3(1, 2, 3);
    group.setVertex3(vertex, 0);

    const target = new THREE.Vector3();
    group.getVertex3(target, 0);
    expect(target).toEqual(vertex);
  });

  test('(set/get)Vertex4', () => {
    const group = new TrapeziumGroup(2);

    const vertex = new THREE.Vector3(1, 2, 3);
    group.setVertex4(vertex, 0);

    const target = new THREE.Vector3();
    group.getVertex4(target, 0);
    expect(target).toEqual(vertex);
  });

  test('add', () => {
    const group = new TrapeziumGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const vertex1 = new THREE.Vector3(10.1, 20.5, 30.5);
    const vertex2 = new THREE.Vector3(10.112, 21.5, 40.5);
    const vertex3 = new THREE.Vector3(5.1, 221.5, 33.5);
    const vertex4 = new THREE.Vector3(3.1, 22.5, 330.5);

    group.add(nodeId, treeIndex, color, vertex1, vertex2, vertex3, vertex4);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.getColor(targetColor, 0);
    expectColorEqual(targetColor, color);

    group.getVertex1(targetVector, 0);
    expectVector3Equal(targetVector, vertex1);

    group.getVertex2(targetVector, 0);
    expectVector3Equal(targetVector, vertex2);

    group.getVertex3(targetVector, 0);
    expectVector3Equal(targetVector, vertex3);

    group.getVertex4(targetVector, 0);
    expectVector3Equal(targetVector, vertex4);
  });
});
