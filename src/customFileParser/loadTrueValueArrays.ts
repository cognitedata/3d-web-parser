import CustomFileReader from './CustomFileReader';
import { filePropertyArrayNames } from './parserParameters';
import * as THREE from 'three';

// Debugging note: This function should never be called on a sector with arrayCount == 0.
export default function loadTrueValueArrays(file: CustomFileReader) {
  const propertyTrueValues: {[name: string]: any[]} = {};
  filePropertyArrayNames.forEach(property => {
    propertyTrueValues[property] = [];
    const clusterCount = file.readUint32();
    // This value is only used for debugging
    const bytesForOneValue = file.readUint32();

    switch (property) {
      case 'color':
        const colorValues = file.readUint8Array(clusterCount * 4);
        for (let j = 0; j < clusterCount; j++) {
          const r = colorValues[j * 4];
          const g = colorValues[j * 4 + 1];
          const b = colorValues[j * 4 + 2];
          // ignoring a, it's not used by PrimitiveGroup.
          propertyTrueValues.color.push(new THREE.Color(r, g, b));
        }
        break;
      case 'normal':
        for (let j = 0; j < clusterCount; j++) {
          const newNormal = new THREE.Vector3(file.readFloat32(), file.readFloat32(), file.readFloat32());
          propertyTrueValues.normal.push(newNormal);
        }
        break;
      default:
        propertyTrueValues[property] = file.readFloat32Array(clusterCount);
        break;
      }
  });

  return propertyTrueValues;
}
