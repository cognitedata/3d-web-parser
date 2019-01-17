// Copyright 2019 Cognite AS

import * as THREE from 'three';
import CircleGroup from '../geometry/CircleGroup';

function createCircleGroup(): CircleGroup {
  const group = new CircleGroup(2);

  const nodeId = 1;
  const treeIndex = 1;
  const color = new THREE.Color(0.5, 0.5, 0.5);
  const center = new THREE.Vector3(1, 2, 3);
  const normal = new THREE.Vector3(4, 5, 6);
  const radius = 10.0;

  group.add(nodeId, treeIndex, color, center, normal, radius);
  return group;
}

describe('CircleGroup', () => {
  test('constructor', () => {
    const group = new CircleGroup(2);
    expect(group.radius.length).toBe(2);
    expect(CircleGroup.type).toBe('Circle');
  });

  test('(set/get)Radius', () => {
    const group = new CircleGroup(2);

    const radius = 1.0;

    group.setRadius(radius, 0);
    expect(group.getRadius(0)).toBeCloseTo(radius);
  });

  test('add', () => {
    const group = new CircleGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const center = new THREE.Vector3(1, 2, 3);
    const normal = new THREE.Vector3(4, 5, 6);
    const radius = 10.0;

    group.add(nodeId, treeIndex, color, center, normal, radius);

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

    expect(group.getRadius(0)).toBeCloseTo(radius);
  });

  test('computeModelMatrix', () => {
    const group = createCircleGroup();

    const matrix = new THREE.Matrix4();
    group.computeModelMatrix(matrix, 0);

    const expectedMatrix = new THREE.Matrix4();
    expectedMatrix.set(12.888888888888888,
      -8.88888888888889,
      -12.444444444444445,
      0,
      -8.88888888888889,
      8.88888888888889,
      -15.555555555555555,
      0,
      0.6222222222222222,
      0.7777777777777778,
      0.0888888888888888,
      0,
      1,
      2,
      3,
      1);
    expectedMatrix.transpose(); // See https://threejs.org/docs/#api/en/math/Matrix4
    for (let i = 0; i < 16; i++) {
      expect(matrix.elements[i]).toBeCloseTo(expectedMatrix.elements[i]);
    }
  });

  test('computeBoundingBox', () => {
    const group = createCircleGroup();
    const matrix = new THREE.Matrix4();
    const box = new THREE.Box3();

    group.computeBoundingBox(matrix, box, 0);

    const expectedBox = new THREE.Box3();
    expectedBox.min = new THREE.Vector3(-7.9006055536002275, -6.217814036133182, -4.297037292405272);
    expectedBox.max = new THREE.Vector3(9.900605553600228, 10.217814036133182, 10.297037292405271);

    group.computeBoundingBox(matrix, box, 0);
    expect(box.min.x).toBeCloseTo(expectedBox.min.x);
    expect(box.min.y).toBeCloseTo(expectedBox.min.y);
    expect(box.min.z).toBeCloseTo(expectedBox.min.z);

    expect(box.max.x).toBeCloseTo(expectedBox.max.x);
    expect(box.max.y).toBeCloseTo(expectedBox.max.y);
    expect(box.max.z).toBeCloseTo(expectedBox.max.z);
  });
});
