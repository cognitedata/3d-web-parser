import * as THREE from 'three';
import Sector from '../Sector';

describe('Sectors', () => {
  test('constructor', () => {
    const min = new THREE.Vector3();
    const max = new THREE.Vector3(1, 1, 1);
    
    const sector = new Sector(min, max);
    expect(sector.min).toBe(min);
    expect(sector.max).toBe(max);
    expect(sector.parent).toBe(undefined);
    expect(sector.children.length).toBe(0);

    expect(sector.depth).toBe(0);
    expect(sector.object3d.frustumCulled).toBe(false);
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
    expect(parent.children.length).toBe(1);

    const child2 = new Sector(min, max);
    parent.addChild(child2);
    expect(child2.parent).toBe(parent);
    expect(parent.children.length).toBe(2);

  });

  test('parent bounding box', () => {
    const parentMin = new THREE.Vector3();
    const parentMax = new THREE.Vector3(1, 1, 1);
    const childMin = new THREE.Vector3();
    const childMax = new THREE.Vector3(0.5, 0.5, 0.5);
    const parent = new Sector(parentMin, parentMax);
    const child = new Sector(childMin, childMax);
    
    parent.addChild(child);
    expect(parent.max.clone().sub(parent.min).length())
      .toBeGreaterThanOrEqual(child.max.clone().sub(child.min).length());
  });
});
