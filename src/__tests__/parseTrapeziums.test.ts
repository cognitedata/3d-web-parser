// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parse from '../parsers/parseTrapeziums';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../TestUtils';
import TrapeziumGroup from '../geometry/TrapeziumGroup';
import * as TestScene from './fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../parsers/parseUtils';

const color = new THREE.Color();
describe('parseTrapeziums', () => {
  test('parseTrapeziums', () => {
    // let group: TrapeziumGroup;
    // // @ts-ignore
    // group = parse(TestScene.geometries);
    // const expectedCount = 8;
    // expect(group.capacity).toBe(expectedCount);
    // for (let i = 0; i < expectedCount; i++) {
    //   expectColorValid(group.getColor(new THREE.Color(), i));
    //   expectVector3Valid(group.getVertex1(new THREE.Vector3(), i));
    //   expectVector3Valid(group.getVertex2(new THREE.Vector3(), i));
    //   expectVector3Valid(group.getVertex3(new THREE.Vector3(), i));
    //   expectVector3Valid(group.getVertex4(new THREE.Vector3(), i));
    // }
  });
});
