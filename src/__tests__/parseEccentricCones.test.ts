// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseEccentricCones from '../parsers/parseEccentricCones';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import EccentricConeGroup from '../geometry/EccentricConeGroup';
import * as TestScene from './fixtures/test_scene.json';

describe('parseEccentricCones', () => {
  test('parseEccentricCones', () => {
    let group: EccentricConeGroup;
    // @ts-ignore
    group = parseEccentricCone(TestScene.geometries);
    // expect(group.capacity).toBe(1);
    // expect(group.getNodeId(0)).toBe(nodeId);
    // expect(group.getTreeIndex(0)).toBe(treeIndex);
    // expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    // expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
    // expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
    // expect(group.getRadiusA(0)).toBeCloseTo(radiusA);
    // expect(group.getRadiusB(0)).toBeCloseTo(radiusB);
    // expect(group.getIsClosed(0)).toBe(isClosed);
    // expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
  });
});
