// Copyright 2019 Cognite AS

const fs = require('fs');
import parse from '../parsers/protobuf/main';
import Sector from '../Sector';
import * as TestScene from './fixtures/test_scene.json';
import { expectBoundingBoxEqual } from '../TestUtils';

describe('Parser', () => {
  test('parse sector', () => {
    const protobufData = fs.readFileSync('./src/__tests__/fixtures/test_scene.pb', null);
    const { rootSector, maps } = parse(protobufData);
    expect(rootSector).toBeInstanceOf(Sector);

    // validate bounding box
    const { boundingBox } = TestScene;
    expectBoundingBoxEqual(rootSector, boundingBox);
    expect(rootSector.parent).toBe(undefined);
    expect(rootSector.children.length).toBe(0);
  });
});
