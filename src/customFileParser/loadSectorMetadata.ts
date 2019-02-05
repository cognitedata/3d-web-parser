import * as THREE from 'three';
import CustomFileReader from './CustomFileReader';
import { SectorMetadata } from './sharedFileParserTypes';

export default function loadSectorMetadata(file: CustomFileReader, sectorByteLength: number) {
  const magicBytes = file.readUint32();
  const formatVersion = file.readUint32();
  const optimizerVersion = file.readUint32();
  const sectorId = file.readUint64();
  const parentSectorId = file.readUint64();
  const sectorBBoxMin = new THREE.Vector3(file.readFloat32(), file.readFloat32(), file.readFloat32());
  const sectorBBoxMax = new THREE.Vector3(file.readFloat32(), file.readFloat32(), file.readFloat32());
  const arrayCount = file.readUint32();

  const sectorMetadata: SectorMetadata = {
    magicBytes: magicBytes,
    formatVersion: formatVersion,
    optimizerVersion: optimizerVersion,
    sectorId: sectorId,
    parentSectorId: parentSectorId,
    arrayCount: arrayCount,
    sectorBBoxMin: sectorBBoxMin,
    sectorBBoxMax: sectorBBoxMax,
  };

  return sectorMetadata;
}
