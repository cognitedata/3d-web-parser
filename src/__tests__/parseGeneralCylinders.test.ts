// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseGeneralCylinders from '../parsers/parseGeneralCylinders';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import GeneralCylinderGroup from '../geometry/GeneralCylinderGroup';
import * as TestScene from './fixtures/test_scene.json';
describe('parseGeneralCylinders', () => {
  test('parseGeneralCylinders', () => {

    let group: GeneralCylinderGroup;
    // @ts-ignore
    group = parseGeneralCylinders(geometries);
    // expect(group.capacity).toBe(1);
    // expect(group.getNodeId(0)).toBe(nodeId);
    // expect(group.getTreeIndex(0)).toBe(treeIndex);
    // expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    // expectVector3Equal(group.getCenterA(new THREE.Vector3(), 0), centerA);
    // expectVector3Equal(group.getCenterB(new THREE.Vector3(), 0), centerB);
    // expect(group.getRadius(0)).toBeCloseTo(radius);
    // expect(group.getHeightA(0)).toBeCloseTo(heightA);
    // expect(group.getHeightB(0)).toBeCloseTo(heightB);
    // expect(group.getSlopeA(0)).toBeCloseTo(slopeA);
    // expect(group.getSlopeB(0)).toBeCloseTo(slopeB);
    // expect(group.getZAngleA(0)).toBeCloseTo(zAngleA);
    // expect(group.getZAngleB(0)).toBeCloseTo(zAngleB);
    // expect(group.getAngle(0)).toBeCloseTo(angle);
    // expect(group.getArcAngle(0)).toBeCloseTo(arcAngle);
  });
});
