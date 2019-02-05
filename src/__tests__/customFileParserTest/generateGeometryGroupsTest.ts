import loadSectorOutline from '../../customFileParser/loadSectorMetadata';
import unpackGeometry from '../../customFileParser/unpackGeometry/main';
import countRenderedGeometries from '../../customFileParser/countRenderedGeometries';
import * as THREE from 'three';
const fs = require('fs');
import { RenderedGeometryGroups } from '../../customFileParser/sharedFileParserTypes';

describe('generateRenderedGeometryGroups', () => {
  test('generate groups', async() => {
    const incomingFile = fs.readFileSync('./src/__tests__/customFileParserTest/Pipes.c3d', null);

    const asArrayBuffer = new ArrayBuffer(incomingFile.length);
    const arrayBufferCopier = new Uint8Array(asArrayBuffer);
    for (let i = 0; i < incomingFile.length; i++) {
      arrayBufferCopier[i] = incomingFile[i];
    }

    const parsedFile = loadSectorOutline(asArrayBuffer, 0, asArrayBuffer.byteLength, true);
    const counts = countRenderedGeometries(parsedFile);
    const geometryGroups = new RenderedGeometryGroups(counts);

    unpackGeometry(geometryGroups, parsedFile, 'Box');

    expect(geometryGroups).toBeDefined();

    expect(geometryGroups.box.capacity).toBe(327);
    // expect(geometryGroups.circle.capacity).toBe(251 + 2 * 435);
    // expect(geometryGroups.cone.capacity).toBe(435);
  });
});
