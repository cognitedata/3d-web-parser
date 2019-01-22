// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseBoxes from '../parsers/parseBoxes';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import BoxGroup from '../geometry/BoxGroup';
import * as TestScene from './fixtures/test_scene.json';

describe('parseBoxes', () => {
  test('parseBoxes', () => {

    let group: BoxGroup;
    // @ts-ignore
    group = parseBoxes(TestScene.geometries);
    console.log('Group: ', group);
    // expect(group.capacity).toBe(1);
    // expect(group.getNodeId(0)).toBe(nodeId);
    // expect(group.getTreeIndex(0)).toBe(treeIndex);
    // expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    // expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    // expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    // expectVector3Equal(group.getDelta(new THREE.Vector3(), 0), delta);
    // expect(group.getAngle(0)).toBeCloseTo(angle);
  });
});
