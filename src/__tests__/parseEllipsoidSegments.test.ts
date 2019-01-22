// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseEllipsoidSegments from '../parsers/parseEllipsoidSegments';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';
import * as TestScene from './fixtures/test_scene.json';

describe('parseEllipsoidSegments', () => {
  test('parseEllipsoidSegments', () => {

    let group: EllipsoidSegmentGroup;
    // @ts-ignore
    group = parseEllipsoidSegments(TestScene.geometries);
    // expect(group.capacity).toBe(1);
    // expect(group.getNodeId(0)).toBe(nodeId);
    // expect(group.getTreeIndex(0)).toBe(treeIndex);
    // expectColorEqual(group.getColor(new THREE.Color(), 0), color);

    // expectVector3Equal(group.getCenter(new THREE.Vector3(), 0), center);
    // expectVector3Equal(group.getNormal(new THREE.Vector3(), 0), normal);
    // expect(group.getVRadius(0)).toBeCloseTo(vRadius);
    // expect(group.getHRadius(0)).toBeCloseTo(hRadius);
    // expect(group.getHeight(0)).toBeCloseTo(height);
    // expect(group.getIsClosed(0)).toBe(isClosed);
  });
});
