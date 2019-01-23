// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseCircles from '../parsers/parseCircles';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../TestUtils';
import CircleGroup from '../geometry/CircleGroup';
import * as TestScene from './fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../parsers/parseUtils';

const color = new THREE.Color();
describe('parseCircles', () => {
  test('parseCircles', () => {
    let group: CircleGroup;
    // @ts-ignore
    group = parseCircles(TestScene.geometries);
    const expectedCircleCount = 8;
    expect(group.capacity).toBe(expectedCircleCount);
    for (let i = 0; i < expectedCircleCount; i++) {
      expectColorValid(group.getColor(new THREE.Color(), i));
      expectVector3Valid(group.getCenter(new THREE.Vector3(), i));
      expectVector3Valid(group.getNormal(new THREE.Vector3(), i));
    }
  });
});
