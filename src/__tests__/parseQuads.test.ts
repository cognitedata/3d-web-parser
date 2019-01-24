// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parse from '../parsers/parseQuads';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../TestUtils';
import QuadGroup from '../geometry/QuadGroup';
import * as TestScene from './fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../parsers/parseUtils';

const color = new THREE.Color();
describe('parseQuads', () => {
  test('parseQuads', () => {
    let group: QuadGroup;
    // @ts-ignore
    group = parse(TestScene.geometries);
    const expectedCount = 0;
    expect(group.capacity).toBe(expectedCount);
    for (let i = 0; i < expectedCount; i++) {
      expectColorValid(group.getColor(new THREE.Color(), i));
      expectVector3Valid(group.getVertex1(new THREE.Vector3(), i));
      expectVector3Valid(group.getVertex2(new THREE.Vector3(), i));
      expectVector3Valid(group.getVertex3(new THREE.Vector3(), i));
    }
  });
});
