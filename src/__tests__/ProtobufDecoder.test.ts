// Copyright 2019 Cognite AS

const fs = require('fs');
import ProtobufDecoder from '../ProtobufDecoder';
import * as TestScene from './fixtures/test_scene.json';

describe('Protobufdecoder', () => {
  test('parse proto format', () => {
    const dataArray = fs.readFileSync('./src/__tests__/fixtures/test_scene.pb', null);
    const protobufDecoder = new ProtobufDecoder();
    for (const webNode of protobufDecoder.decodeWebScene(dataArray)) {
      const plainJsObject = JSON.parse(JSON.stringify(webNode));
      expect(plainJsObject).toEqual(TestScene);
    }
  });
});
