// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parse from '../parsers/parseGeneralRings';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../TestUtils';
import GeneralRingGroup from '../geometry/GeneralRingGroup';
import * as TestScene from './fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../parsers/parseUtils';

const color = new THREE.Color();
describe('parseGeneralRings', () => {
  test('parseGeneralRings', () => {
    // let group: GeneralRingGroup;
    // // @ts-ignore
    // group = parse(TestScene.geometries);
    // const expectedCount = 30;
    // expect(group.capacity).toBe(expectedCount);
    // for (let i = 0; i < expectedCount; i++) {
    //   expectColorValid(group.getColor(new THREE.Color(), i));
    //   expectVector3Valid(group.getCenter(new THREE.Vector3(), i));
    //   expectVector3Valid(group.getLocalXAxis(new THREE.Vector3(), i));
    //   expectVector3Valid(group.getNormal(new THREE.Vector3(), i));
    // }
  });
});
