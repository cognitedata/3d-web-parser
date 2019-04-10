// Copyright 2019 Cognite AS

import * as THREE from 'three';
import CustomFileReader from '../../parsers/i3d/CustomFileReader';
import { parseFullCustomFile } from '../../parsers/i3d/main';
import { filePrimitiveNames, filePropertyArrayNames, filePropertyArrayNameType }
  from '../../parsers/i3d/parserParameters';

// @ts-ignore
const fs = require('fs');

const rootSectorFilePath = './src/__tests__/fixtures/extra_primitives/web_node_4_0.i3d';
const nonRootSectorFilePath = './src/__tests__/fixtures/extra_primitives/web_node_4_0.i3d';
const multiSectorFilePath = './src/__tests__/fixtures/extra_primitives/web_scene_4.i3d';

function fileToArrayBuffer(filePath: string) {
  const fileBuffer = fs.readFileSync(filePath, null);
  const asArrayBuffer = new ArrayBuffer(fileBuffer.length);
  const arrayBufferCopier = new Uint8Array(asArrayBuffer);
  for (let i = 0; i < fileBuffer.length; i++) {
    arrayBufferCopier[i] = fileBuffer[i];
  }

  return asArrayBuffer;
}

class FakeMeshLoader {
  constructor() {}
  async loadGeometry(fileId: number) {}
}

describe('customFileIntegrationTest', () => {
  test('read any sector metadata', async() => {
    const fileBuffer = fileToArrayBuffer(rootSectorFilePath);
    const fileReader = new CustomFileReader(fileBuffer);
    fileReader.readUint32(); // skip file length
    const sectorMetadata = fileReader.readSectorMetadata();

    expect(sectorMetadata.magicBytes).toBe(1178874697);
    expect(sectorMetadata.formatVersion).toBeDefined();
    expect(sectorMetadata.optimizerVersion).toBeDefined();
    expect(sectorMetadata.sectorId).toBeDefined();
    expect(sectorMetadata.parentSectorId).toBeDefined();
    expect(sectorMetadata.arrayCount).toBe(filePropertyArrayNames.length);
    expect(sectorMetadata.sectorBBoxMin).toBeDefined();
    expect(sectorMetadata.sectorBBoxMax).toBeDefined();
    expect(sectorMetadata.sectorBBoxMax.x).toBeGreaterThan(sectorMetadata.sectorBBoxMin.x);
    expect(sectorMetadata.sectorBBoxMax.y).toBeGreaterThan(sectorMetadata.sectorBBoxMin.y);
    expect(sectorMetadata.sectorBBoxMax.z).toBeGreaterThan(sectorMetadata.sectorBBoxMin.z);
  });

  test('read root-sector UncompressedValues', async() => {
    const fileBuffer = fileToArrayBuffer(rootSectorFilePath);
    const fileReader = new CustomFileReader(fileBuffer);
    fileReader.readUint32(); // skip file length
    const sectorMetadata = fileReader.readSectorMetadata();
    expect(sectorMetadata.arrayCount).toBe(filePropertyArrayNames.length);

    const uncompressedValues = fileReader.readUncompressedValues();

    expect(Object.keys(uncompressedValues).length).toBe(filePropertyArrayNames.length);
    Object.keys(uncompressedValues).forEach(parameterName => {
      expect(filePropertyArrayNames.indexOf(parameterName as filePropertyArrayNameType)).not.toBe(-1);
      if (uncompressedValues[parameterName]!.length > 0) {
        if (parameterName === 'normal') {
          expect(uncompressedValues[parameterName]![0] instanceof THREE.Vector3);
        } else {
          expect(uncompressedValues[parameterName]![0] instanceof Number);
        }
      } else {
        // tslint:disable-next-line
        console.log('Test is missing uncompressedValues of type ' + parameterName);
      }
    });
  });

  test('read any sector geometry group index pointers', async() => {
    const fileBuffer = fileToArrayBuffer(nonRootSectorFilePath);
    const fileReader = new CustomFileReader(fileBuffer);
    fileReader.readUint32(); // skip file length
    const sectorMetadata = fileReader.readSectorMetadata();
    if (sectorMetadata.arrayCount !== 0) {
      fileReader.readUncompressedValues();
    }
    const compressedPrimitiveData = fileReader.readCompressedGeometryData(fileBuffer.byteLength).primitives;

    // Check that the sector has geometries. If it doesn't, run this test on a different file.
    expect(compressedPrimitiveData!.length).toBeGreaterThan(0);

    compressedPrimitiveData.forEach(compressedPrimitive => {
      expect((filePrimitiveNames).indexOf(compressedPrimitive.type)).not.toBe(-1);
      expect(compressedPrimitive.nodeIds).toBeDefined();
      expect(compressedPrimitive.indices).toBeDefined();
      expect(compressedPrimitive.count).toBeGreaterThan(0);
      expect(compressedPrimitive.byteCount).toBeGreaterThan(0);
      expect(compressedPrimitive.attributeCount).toBeDefined();
    });
  });

  test('read multi-sector file', async() => {
    const fileBuffer = fileToArrayBuffer(multiSectorFilePath);
    const { rootSector, sectors, sceneStats } = await parseFullCustomFile(fileBuffer, new FakeMeshLoader());
    Object.keys(sectors).forEach(sectorId => {
      const sector = sectors[sectorId];
      sector.primitiveGroups.forEach(primitiveGroup => {
        expect(primitiveGroup.type).toBeDefined();
        expect(primitiveGroup.data.count).toBeDefined();
        expect(primitiveGroup.capacity).toBeDefined();
      });
    });
  });
});
