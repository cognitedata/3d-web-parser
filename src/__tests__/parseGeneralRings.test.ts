// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseGeneralRings from '../parsers/parseGeneralRings';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import GeneralRingGroup from '../geometry/GeneralRingGroup';
import * as TestScene from './fixtures/test_scene.json';

describe('parseGeneralRings', () => {
  test('parseGeneralRings', () => {
    let group: GeneralRingGroup;
    // @ts-ignore
    group = parseGeneralRings(TestScene.geometries);
    // expect(group.capacity).toBe(1);
    // expect(group.getNodeId(0)).toBe(nodeId);
    // expect(group.getTreeIndex(0)).toBe(treeIndex);
    // expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    // expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    // expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    // expect(group.getXRadius(0)).toBe(xRadius);
    // expect(group.getYRadius(0)).toBe(yRadius);
    // expectVector3Equal(group.getLocalXAxis(new THREE.Vector3(), 0), localXAxis);
    // expect(group.getThickness(0)).toBe(thickness);
    // expect(group.getAngle(0)).toBe(angle);
    // expect(group.getArcAngle(0)).toBe(arcAngle);
  });
});
