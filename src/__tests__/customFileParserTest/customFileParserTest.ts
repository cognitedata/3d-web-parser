import readSegmentFile from '../../customFileParser/readSegmentFile';
import generateGeometryGroups from '../../customFileParser/generateGeometryGroups';
import * as THREE from 'three';
const fs = require('fs');

describe('customFileParser', () => {
  test('generate groups', async() => {
    const incomingFile = fs.readFileSync('./src/__tests__/customFileParserTest/Pipes.c3d', null);

    const asArrayBuffer = new ArrayBuffer(incomingFile.length);
    const arrayBufferCopier = new Uint8Array(asArrayBuffer);
    for (let i = 0; i < incomingFile.length; i++) {
      arrayBufferCopier[i] = incomingFile[i];
    }

    const parsedFile = readSegmentFile(asArrayBuffer, true);
    const geometryGroups = generateGeometryGroups(parsedFile);

    expect(geometryGroups).toBeDefined();

    expect(geometryGroups.boxGroup.capacity).toBe(327);
    expect(geometryGroups.circleGroup.capacity).toBe(251 + 2 * 435);
    expect(geometryGroups.coneGroup.capacity).toBe(435);
  });
});
