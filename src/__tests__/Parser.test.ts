// Copyright 2019 Cognite AS

const fs = require('fs');
import Parser from '../Parser';
import Sector from '../Sector';
import * as TestScene from './fixtures/test_scene.json';
import { expectBoundingBoxEqual } from '../TestUtils';

describe('Parser', () => {
  test('parse sector', async () => {
    const protobufData = fs.readFileSync('./src/__tests__/fixtures/test_scene.pb', null);
    const rootSector = await Parser(protobufData);
    expect(rootSector).toBeInstanceOf(Sector);

    // validate bounding box
    const { boundingBox } = TestScene;
    expectBoundingBoxEqual(rootSector, boundingBox);
  });
});
