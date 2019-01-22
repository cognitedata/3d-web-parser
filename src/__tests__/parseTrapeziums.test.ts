// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseTrapeziums from '../parsers/parseTrapeziums';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import TrapeziumGroup from '../geometry/TrapeziumGroup';
import * as TestScene from './fixtures/test_scene.json';

describe('parseTrapeziums', () => {
  test('parseTrapeziums', () => {
    let group: TrapeziumGroup;
    // @ts-ignore
    group = parseTrapeziums(TestScene.geometries);
    // expect(group.capacity).toBe(1);
    // expect(group.getNodeId(0)).toBe(nodeId);
    // expect(group.getTreeIndex(0)).toBe(treeIndex);
    // expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    // expectVector3Equal(group.getVertex1(new THREE.Vector3(), 0), vertex1);
    // expectVector3Equal(group.getVertex2(new THREE.Vector3(), 0), vertex2);
    // expectVector3Equal(group.getVertex3(new THREE.Vector3(), 0), vertex3);
    // expectVector3Equal(group.getVertex4(new THREE.Vector3(), 0), vertex4);
  });
});
