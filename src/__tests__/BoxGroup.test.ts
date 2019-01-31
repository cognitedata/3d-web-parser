// Copyright 2019 Cognite AS

import * as THREE from 'three';
import BoxGroup from '../geometry/BoxGroup';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';

function createBoxGroup(): BoxGroup {
  const group = new BoxGroup(1);
  const nodeId = 1;
  const treeIndex = 1;
  const color = new THREE.Color(0.5, 0.5, 0.5);
  const center = new THREE.Vector3(1, 2, 3);
  const normal = new THREE.Vector3(4, 5, 6);
  const angle = 1.0;
  const delta = new THREE.Vector3(1, 1, 1);
  group.add(nodeId, treeIndex, color, center, normal, angle, delta);
  return group;
}

describe('BoxGroup', () => {
  test('constructor', () => {
    const group = new BoxGroup(2);
    expect(group.angle.length).toBe(2);
    expect(group.delta.length).toBe(6);
    expect(group.hasCustomTransformAttributes).toBeFalsy();
    expect(group.type).toBe('Box');
  });

  test('(set/get)Angle', () => {
    const group = new BoxGroup(2);

    const angle1 = 1.0;
    const angle2 = 10.0;

    group.setAngle(angle1, 0);
    expect(group.getAngle(0)).toBeCloseTo(angle1);

    group.setAngle(angle2, 1);
    expect(group.getAngle(0)).toBeCloseTo(angle1);
    expect(group.getAngle(1)).toBeCloseTo(angle2);
  });

  test('(set/get)Delta', () => {
    const group = new BoxGroup(1);

    const delta = new THREE.Vector3(1, 2, 3);
    const target = new THREE.Vector3();

    group.setDelta(delta, 0);
    expect(group.getDelta(target, 0)).toEqual(delta);
  });

  test('add', () => {
    const group = new BoxGroup(2);

    const nodeId = 1;
    const treeIndex = 1;
    const color = new THREE.Color(0.5, 0.5, 0.5);
    const center = new THREE.Vector3(1, 2, 3);
    const normal = new THREE.Vector3(4, 5, 6);
    const angle = 10.0;
    const delta = new THREE.Vector3(10, 10, 10);

    group.add(nodeId, treeIndex, color, center, normal, angle, delta);
    const targetVector = new THREE.Vector3();
    const targetColor = new THREE.Color();

    expect(group.count).toBe(1);

    expect(group.getNodeId(0)).toBe(nodeId);
    expect(group.getTreeIndex(0)).toBe(treeIndex);

    group.getColor(targetColor, 0);
    expectColorEqual(targetColor, color);

    group.getCenter(targetVector, 0);
    expectVector3Equal(targetVector, center);

    group.getNormal(targetVector, 0);
    expectVector3Equal(targetVector, normal);

    expect(group.getAngle(0)).toBeCloseTo(angle);

    group.getDelta(targetVector, 0);
    expectVector3Equal(targetVector, delta);
  });

  test('computeModelMatrix', () => {
    const group = createBoxGroup();

    const matrix = new THREE.Matrix4();
    group.computeModelMatrix(matrix, 0);

    const expectedMatrix = new THREE.Matrix4();
    expectedMatrix.set(-0.02579228502181974,
      0.1338527461954474,
      -0.9906655340574289,
      0,
      -0.7824156594842622,
      0.6141214625226827,
      0.10334681931636025,
      0,
      0.6222222222222222,
      0.7777777777777779,
      0.08888888888888868,
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
    const group = createBoxGroup();
    const matrix = new THREE.Matrix4();
    const box = new THREE.Box3();

    const expectedBox = new THREE.Box3();
    expectedBox.min = new THREE.Vector3(0.28478491663584793, 1.237124006752046, 2.408549378868661);
    expectedBox.max = new THREE.Vector3(1.7152150833641522, 2.7628759932479543, 3.591450621131339);

    group.computeBoundingBox(matrix, box, 0);
    expect(box.min.x).toBeCloseTo(expectedBox.min.x);
    expect(box.min.y).toBeCloseTo(expectedBox.min.y);
    expect(box.min.z).toBeCloseTo(expectedBox.min.z);

    expect(box.max.x).toBeCloseTo(expectedBox.max.x);
    expect(box.max.y).toBeCloseTo(expectedBox.max.y);
    expect(box.max.z).toBeCloseTo(expectedBox.max.z);
  });
});
