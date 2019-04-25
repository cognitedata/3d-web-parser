// Copyright 2019 Cognite AS

import * as THREE from 'three';
import Sector from '../Sector';

describe('Sectors', () => {
  test('constructor', () => {
    const min = new THREE.Vector3();
    const max = new THREE.Vector3(1, 1, 1);
    const sector = new Sector(min, max);
    expect(sector.min).toBe(min);
    expect(sector.max).toBe(max);
    expect(sector.path).toBe('0/');
    expect(sector.parent).toBe(undefined);
    expect(sector.children.length).toBe(0);

    expect(sector.depth).toBe(0);
    expect(sector.object3d.frustumCulled).toBe(false);

    expect(sector.primitiveGroups.length).toBe(0);
  });

  test('add child', () => {
    const min = new THREE.Vector3();
    const max = new THREE.Vector3(1, 1, 1);

    const parent = new Sector(min, max);
    const child1 = new Sector(min, max);
    expect(child1.parent).toBe(undefined);
    expect(parent.children.length).toBe(0);

    parent.addChild(child1);
    expect(child1.parent).toBe(parent);
    expect(child1.depth).toBe(parent.depth + 1);
    expect(parent.children.length).toBe(1);
    expect(parent.object3d.children[0]).toBe(child1.object3d);
    expect(child1.path).toBe('0/0/');

    const child2 = new Sector(min, max);
    parent.addChild(child2);
    expect(child2.parent).toBe(parent);
    expect(child2.depth).toBe(parent.depth + 1);
    expect(parent.children.length).toBe(2);
    expect(parent.object3d.children[0]).toBe(child1.object3d);
    expect(parent.object3d.children[1]).toBe(child2.object3d);
    expect(child2.path).toBe('0/1/');
  });

  test('parent bounding box', () => {
    const parentMin = new THREE.Vector3();
    const parentMax = new THREE.Vector3(1, 1, 1);
    const childMin = new THREE.Vector3();
    const childMax = new THREE.Vector3(0.5, 0.5, 0.5);
    const parent = new Sector(parentMin, parentMax);
    const child = new Sector(childMin, childMax);

    parent.addChild(child);
    expect(
      parent.max
        .clone()
        .sub(parent.min)
        .length()
    ).toBeGreaterThanOrEqual(
      child.max
        .clone()
        .sub(child.min)
        .length()
    );
  });

  test('traverse children', () => {
    const rootSector = new Sector(new THREE.Vector3(), new THREE.Vector3());
    const rootFirstSector = new Sector(new THREE.Vector3(), new THREE.Vector3());
    rootSector.addChild(rootFirstSector);
    const rootSecondSector = new Sector(new THREE.Vector3(), new THREE.Vector3());
    rootSector.addChild(rootSecondSector);
    const rootSecondFirstSector = new Sector(new THREE.Vector3(), new THREE.Vector3());
    rootSecondSector.addChild(rootSecondFirstSector);
    const expected = [rootSector, rootFirstSector, rootSecondSector, rootSecondFirstSector];
    let counter = 0;
    for (const sector of rootSector.traverseSectors()) {
      expect(sector).toBe(expected[counter++]);
    }
  });
});
