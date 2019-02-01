// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parse from '../parsers/parseCones';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../TestUtils';
import ConeGroup from '../geometry/ConeGroup';
import * as TestScene from './fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../parsers/parseUtils';

const color = new THREE.Color();
describe('parseCones', () => {
  test('parseCones', () => {
    let group: ConeGroup;
    // @ts-ignore
    group = parse(TestScene.geometries);
    const expectedCount = 20;
    expect(group.capacity).toBe(expectedCount);
    for (let i = 0; i < expectedCount; i++) {
      expectColorValid(group.getColor(new THREE.Color(), i));
      expectVector3Valid(group.getCenterA(new THREE.Vector3(), i));
      expectVector3Valid(group.getCenterB(new THREE.Vector3(), i));
    }
  });
});
