// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parse from '../parsers/parseEccentricCones';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../TestUtils';
import EccentricConeGroup from '../geometry/EccentricConeGroup';
import * as TestScene from './fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../parsers/parseUtils';

const color = new THREE.Color();
describe('parseEccentricCones', () => {
  test('parseEccentricCone', () => {
    let group: EccentricConeGroup;
    // @ts-ignore
    group = parse(TestScene.geometries);
    const expectedCount = 8;
    expect(group.capacity).toBe(expectedCount);
    for (let i = 0; i < expectedCount; i++) {
      expectColorValid(group.getColor(new THREE.Color(), i));
      expectVector3Valid(group.getCenterA(new THREE.Vector3(), i));
      expectVector3Valid(group.getCenterB(new THREE.Vector3(), i));
      expectVector3Valid(group.getNormal(new THREE.Vector3(), i));
    }
  });
});
