// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parse from '../../parsers/protobuf/parseEllipsoidSegments';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../../TestUtils';
import EllipsoidSegmentGroup from '../../geometry/EllipsoidSegmentGroup';
import * as TestScene from '../fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../../parsers/protobuf/protobufUtils';

const color = new THREE.Color();
describe('parseEllipsoidSegments', () => {
  test('parseEllipsoidSegments', () => {
    // let group: EllipsoidSegmentGroup;
    // // @ts-ignore
    // group = parse(TestScene.geometries);
    // const expectedCount = 4;
    // expect(group.capacity).toBe(expectedCount);
    // for (let i = 0; i < expectedCount; i++) {
    //   expectColorValid(group.getColor(new THREE.Color(), i));
    //   expectVector3Valid(group.getCenter(new THREE.Vector3(), i));
    //   expectVector3Valid(group.getNormal(new THREE.Vector3(), i));
    // }
  });
});
