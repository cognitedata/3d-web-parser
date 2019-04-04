import * as THREE from 'three';
import CustomFileReader from './CustomFileReader';
import { SectorMetadata } from './sharedFileParserTypes';

const MAGIC_BYTES = 0x46443349;

export default function loadSectorMetadata(fileReader: CustomFileReader) {
  const magicBytes = fileReader.readUint32();
  if (magicBytes !== MAGIC_BYTES) {
    throw Error('Start of sector file is incorrect.Expected ' +
      MAGIC_BYTES.toString(16) + ', got ' + magicBytes.toString(16));
  }
  const formatVersion = fileReader.readUint32();
  const optimizerVersion = fileReader.readUint32();
  const sectorId = fileReader.readUint64();
  const parentSectorId = fileReader.readUint64();
  const sectorBBoxMin = new THREE.Vector3(fileReader.readFloat32(), fileReader.readFloat32(), fileReader.readFloat32());
  const sectorBBoxMax = new THREE.Vector3(fileReader.readFloat32(), fileReader.readFloat32(), fileReader.readFloat32());
  const arrayCount = fileReader.readUint32();

  const sectorMetadata: SectorMetadata = {
    magicBytes: magicBytes,
    formatVersion: formatVersion,
    optimizerVersion: optimizerVersion,
    sectorId: sectorId,
    parentSectorId: parentSectorId,
    sectorBBoxMin: sectorBBoxMin,
    sectorBBoxMax: sectorBBoxMax,
    arrayCount: arrayCount,
  };

  return sectorMetadata;
}
