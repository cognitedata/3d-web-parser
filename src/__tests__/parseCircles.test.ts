// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseCircles from '../parsers/parseCircles';
import { expectVector3Equal, expectColorEqual } from '../TestUtils';
import CircleGroup from '../geometry/CircleGroup';
import * as TestScene from './fixtures/test_scene.json';

describe('parseCircles', () => {
  test('parseCircles', () => {

    let group: CircleGroup;
    // @ts-ignore
    group = parseCircles(TestScene.geometries);
  });
});
