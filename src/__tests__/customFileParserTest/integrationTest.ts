import * as THREE from 'three';
import CustomFileReader from '../../customFileParser/CustomFileReader';
import { parseManySectors } from '../../customFileParser/main';
import { fileGeometries, filePropertyArrayNames } from '../../customFileParser/parserParameters';

// @ts-ignore
const fs = require('fs');

const rootSectorFilePath = './src/__tests__/fixtures/web_node_4_0.i3d';
const nonRootSectorFilePath = './src/__tests__/fixtures/web_node_4_3.i3d';
const multiSectorFilePath = './src/__tests__/fixtures/web_scene.pi3d';

function fileToArrayBuffer(filePath: string) {
  const incomingFile = fs.readFileSync(filePath, null);
  const asArrayBuffer = new ArrayBuffer(incomingFile.length);
  const arrayBufferCopier = new Uint8Array(asArrayBuffer);
  for (let i = 0; i < incomingFile.length; i++) {
    arrayBufferCopier[i] = incomingFile[i];
  }

  return asArrayBuffer;
}

describe('customFileIntegrationTest', () => {
  test('read any sector metadata', async() => {
    const incomingFile = fileToArrayBuffer(rootSectorFilePath);
    const file = new CustomFileReader(incomingFile);
    const sectorMetadata = file.readSectorMetadata(incomingFile.byteLength);

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

  test('read root-sector TrueValueArrays', async() => {
    const incomingFile = fileToArrayBuffer(rootSectorFilePath);
    const file = new CustomFileReader(incomingFile);
    file.readSectorMetadata(incomingFile.byteLength);
    expect(file.location).toBeLessThan(incomingFile.byteLength);
    const trueValueArrays = file.readTrueValueArrays();

    expect(Object.keys(trueValueArrays).length).toBe(filePropertyArrayNames.length);
    Object.keys(trueValueArrays).forEach(parameterName => {
      expect(filePropertyArrayNames.indexOf(parameterName)).not.toBe(-1);
      expect(trueValueArrays[parameterName].length).toBeGreaterThan(0);
      if (parameterName === 'color') {
        expect(trueValueArrays[parameterName][0] instanceof THREE.Color);
      } else if (parameterName === 'normal') {
        expect(trueValueArrays[parameterName][0] instanceof THREE.Vector3);
      } else {
        expect(trueValueArrays[parameterName][0] instanceof Number);
      }
    });
  });

  test('read any sector geometry group index pointers', async() => {
    const incomingFile = fileToArrayBuffer(nonRootSectorFilePath);
    const file = new CustomFileReader(incomingFile);
    const sectorMetadata = file.readSectorMetadata(incomingFile.byteLength);
    expect(sectorMetadata.arrayCount).toBe(0);
    const geometryIndexHandlers = file.readSectorGeometryIndexHandlers(incomingFile.byteLength);

    // Check that the sector has geometries. If it doesn't, run this test on a different file.
    expect(geometryIndexHandlers.length).toBeGreaterThan(0);

    geometryIndexHandlers.forEach(geometryIndexHandler => {
      expect(fileGeometries.indexOf(geometryIndexHandler.name)).not.toBe(-1);
      expect(geometryIndexHandler.nodeIds).toBeDefined();
      expect(geometryIndexHandler.indexes).toBeDefined();
      expect(geometryIndexHandler.geometryCount).toBeGreaterThan(0);
      expect(geometryIndexHandler.byteCount).toBeGreaterThan(0);
      expect(geometryIndexHandler.attributeCount).toBeDefined();
    });
  });

  test('read multi-sector file', async() => {
    const incomingFile = fileToArrayBuffer(multiSectorFilePath);
    const rootSector = parseManySectors(incomingFile);

    const sectors = [rootSector];
    while (sectors.length > 0) {
      const sector = sectors.pop();
      expect(sector).toBeDefined();

      // @ts-ignore. Sector is not undefined
      sector!.children.forEach(child => {
        sectors.push(child);
      });

      // @ts-ignore. Sector is not undefined
      sector.primitiveGroups.forEach(primitiveGroup => {
        expect(primitiveGroup.type).toBeDefined();
        expect(primitiveGroup.count).toBeDefined();
        expect(primitiveGroup.capacity).toBeDefined();
        expect(primitiveGroup.nodeId).toBeDefined();
        expect(primitiveGroup.count).toBe(primitiveGroup.capacity);
      });
    }
  });
});
