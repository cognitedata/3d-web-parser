import * as THREE from 'three';
import FibonacciDecoder from './FibonacciDecoder';
import BufferReader from './BufferReader';
import { propertyNames, allGeometryNames, SectorInformation, GeometryIndexInformation,
  extraGeometryProperties, NodeIdReader } from './sharedFileParserTypes';

const specialByteSizes: {[index: string]: number} = {
  'color': 4,
  'normal': 12,
};

const defaultColor = new THREE.Color(42, 42, 42);

export default function readSegmentFile(asArrayBuffer: ArrayBuffer, flip: boolean): SectorInformation {
  const fileReader = new BufferReader(asArrayBuffer, true);
  const sectorInformation: SectorInformation = {
    propertyTrueValues: {
      color: [defaultColor],
      centerX: [],
      centerY: [],
      centerZ: [],
      normal: [],
      delta: [],
      height: [],
      radius: [],
      angle: [],
      translationX: [],
      translationY: [],
      translationZ: [],
      scaleX: [],
      scaleY: [],
      scaleZ: [],
    },
    geometryIndexes: {},
  };

  sectorInformation.magicBytes = fileReader.readUint32();
  sectorInformation.formatVersion = fileReader.readUint32();
  sectorInformation.optimizerVersion = fileReader.readUint32();
  sectorInformation.sectorId = fileReader.readUint64();
  sectorInformation.parentSectorId = fileReader.readUint64();
  sectorInformation.arrayCount = fileReader.readUint32();

  for (let arrayId = 0; arrayId < sectorInformation.arrayCount;  arrayId++) {
    const clusterCount = fileReader.readUint32();
    const bytesForOneValue = fileReader.readUint32();
    const propertyName = propertyNames[arrayId];

    let expectedByteSize = specialByteSizes[propertyName];
    expectedByteSize = expectedByteSize ? expectedByteSize : 4;
    if (bytesForOneValue !== expectedByteSize) {
      // throw Error('Incorrect number of bytes for property ' + propertyName +
      // ' (Expected ' + expectedByteSize + ', got ' + bytesForOneValue);
    }

    switch (propertyName) {
      case 'color':
        const colorValues = fileReader.readUint8Array(clusterCount * 4);
        for (let j = 0; j < clusterCount; j++) {
          const r = colorValues[j * 4];
          const g = colorValues[j * 4 + 1];
          const b = colorValues[j * 4 + 2];
          // ignoring a, it's not used by PrimitiveGroup.
          sectorInformation.propertyTrueValues.color.push(new THREE.Color(r, g, b));
        }
        break;
      case 'normal':
        const normalValues = fileReader.readFloat32Array(clusterCount * 3);
        for (let j = 0; j < clusterCount; j++) {
          const newNormal = new THREE.Vector3(normalValues[j * 3], normalValues[j * 3 + 1], normalValues[j * 3 + 2]);
          sectorInformation.propertyTrueValues.normal.push(newNormal);
        }
        break;
      default:
        // @ts-ignore
        sectorInformation.propertyTrueValues[propertyName] = fileReader.readFloat32Array(clusterCount);
        break;
    }
  }

  sectorInformation.geometryIndexes = {};
  while (fileReader.location < asArrayBuffer.byteLength) {
    const name = allGeometryNames[fileReader.readUint32()];
    const geometryCount = fileReader.readUint32();
    const attributeCount = fileReader.readUint32();
    const byteCount = fileReader.readUint32();
    const properties = extraGeometryProperties[name];

    let expectedAttributeCount = 0;
    for (let i = 0; i < properties.length; i++) {
      switch (properties[i]) {
        case 'center':
        case 'delta':
        case 'translation':
        case 'rotation3':
        case 'scale':
          expectedAttributeCount += 3;
          break;
        default:
          expectedAttributeCount += 1;
          break;
      }
    }
    if (attributeCount !== expectedAttributeCount) {
      throw Error('Incorrect atttibute count for type ' + name + '. Expected ' +
      expectedAttributeCount + ', got ' +
      attributeCount);
    }

    const nodeIds = new NodeIdReader(asArrayBuffer, fileReader.location, geometryCount * 7);
    fileReader.skip(geometryCount * 7);
    const indexes = new FibonacciDecoder(asArrayBuffer, fileReader.location, byteCount);
    fileReader.skip(byteCount);

    const newGeometry: GeometryIndexInformation = {
      name: name,
      properties: properties,
      nodeIds: nodeIds,
      indexes: indexes,
      geometryCount: geometryCount,
      byteCount: byteCount,
      attributeCount: attributeCount,
    };

    sectorInformation.geometryIndexes[newGeometry.name] = newGeometry;
  }

  return sectorInformation;
}
