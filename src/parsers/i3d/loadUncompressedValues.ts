// Copyright 2019 Cognite AS

import CustomFileReader from './CustomFileReader';
import { FilePropertyArrayNames } from './parserParameters';
import * as THREE from 'three';
import { TextureInfo, UncompressedValues } from './sharedFileParserTypes';

// Debugging note: This function should never be called on a sector with arrayCount == 0.
export default function loadUncompressedValues(fileReader: CustomFileReader) {
  const uncompressedValues: UncompressedValues = {};
  FilePropertyArrayNames.forEach(property => {
    uncompressedValues[property] = [];
    const clusterCount = fileReader.readUint32();
    const bytesForOneValue = fileReader.readUint8();

    switch (property) {
      case 'color':
        if (bytesForOneValue !== 4) {
          throw Error('Reading incorrect number of bytes for color');
        }
        const colorValues = fileReader.readUint8Array(clusterCount * 4);
        for (let j = 0; j < clusterCount; j++) {
          const r = colorValues[j * 4] / 255;
          const g = colorValues[j * 4 + 1] / 255;
          const b = colorValues[j * 4 + 2] / 255;
          // ignoring a, it's not used by PrimitiveGroup.
          uncompressedValues.color!.push(new THREE.Color(r, g, b));
        }
        break;
      case 'normal':
        if (bytesForOneValue !== 12) {
          throw Error('Reading incorrect number of bytes for normal');
        }
        for (let j = 0; j < clusterCount; j++) {
          const newNormal = new THREE.Vector3(
            fileReader.readFloat32(),
            fileReader.readFloat32(),
            fileReader.readFloat32()
          );
          uncompressedValues.normal!.push(newNormal);
        }
        break;
      case 'fileId':
        if (bytesForOneValue !== 8) {
          throw Error('Reading incorrect number of bytes for fileId');
        }
        for (let j = 0; j < clusterCount; j++) {
          uncompressedValues.fileId!.push(fileReader.readUint64());
        }
        break;
      case 'texture':
        if (bytesForOneValue !== 16) {
          throw Error('Reading incorrect number of bytes for fileId');
        }
        for (let j = 0; j < clusterCount; j++) {
          const fileId = fileReader.readUint64();
          const width = fileReader.readUint16();
          const height = fileReader.readUint16();
          const _reserved = fileReader.readUint32();
          uncompressedValues.texture!.push({fileId: fileId, width: width, height: height});
        }
        break;
      default:
        if (bytesForOneValue !== 4) {
          throw Error('Reading incorrect number of bytes for ' + property);
        }
        uncompressedValues[property] = fileReader.readFloat32Array(clusterCount);
        break;
    }
  });

  return uncompressedValues;
}
