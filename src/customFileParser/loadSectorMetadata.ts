import * as THREE from 'three';
import CustomFileReader from './CustomFileReader';
import { SectorMetadata } from './sharedFileParserTypes';

export default function loadSectorMetadata(fileReader: CustomFileReader, sectorByteLength: number) {
  const magicBytes = fileReader.readUint32();
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
