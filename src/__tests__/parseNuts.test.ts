// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseNuts from '../parsers/parseNuts';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import NutGroup from '../geometry/NutGroup';
import * as TestScene from './fixtures/test_scene.json';

describe('parseNuts', () => {
  test('parseNuts', () => {
    let group: NutGroup;
    // @ts-ignore
    group = parseNuts(TestScene.geometries);
    // expect(group.capacity).toBe(1);
    // expect(group.getNodeId(0)).toBe(nodeId);
    // expect(group.getTreeIndex(0)).toBe(treeIndex);
    // expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    // expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
    // expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
    // expect(group.getRadius(0)).toBeCloseTo(radius);
    // expect(group.getRotationAngle(0)).toBeCloseTo(rotationAngle);
  });
});
