// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parse from '../parsers/parseNuts';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../TestUtils';
import NutGroup from '../geometry/NutGroup';
import * as TestScene from './fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../parsers/parseUtils';

const color = new THREE.Color();
describe('parseNuts', () => {
  test('parseNuts', () => {
    let group: NutGroup;
    // @ts-ignore
    group = parse(TestScene.geometries);
    const expectedCount = 2;
    expect(group.capacity).toBe(expectedCount);
    for (let i = 0; i < expectedCount; i++) {
      expectColorValid(group.getColor(new THREE.Color(), i));
      expectVector3Valid(group.getCenterA(new THREE.Vector3(), i));
      expectVector3Valid(group.getCenterB(new THREE.Vector3(), i));
    }
  });
});
