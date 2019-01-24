// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parse from '../parsers/parseTorusSegments';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../TestUtils';
import TorusSegmentGroup from '../geometry/TorusSegmentGroup';
import * as TestScene from './fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../parsers/parseUtils';

const color = new THREE.Color();
describe('parseTorusSegments', () => {
  test('parseTorusSegments', () => {
    let group: TorusSegmentGroup;
    // @ts-ignore
    group = parse(TestScene.geometries);
    const expectedCount = 4;
    expect(group.capacity).toBe(expectedCount);
    for (let i = 0; i < expectedCount; i++) {
      expectColorValid(group.getColor(new THREE.Color(), i));
      expectVector3Valid(group.getCenter(new THREE.Vector3(), i));
      expectVector3Valid(group.getNormal(new THREE.Vector3(), i));
    }
  });
});
