import * as THREE from 'three';
import FibonacciDecoder from './FibonacciDecoder';
import BufferReader from './BufferReader';
import { MorphBlendMeshAnimation, BufferGeometryLoader } from 'three';

const propertyNames = ['color', 'centerX', 'centerY', 'centerZ', 'normal', 'delta', 'height', 'radius',
'angle', 'translationX', 'translationY', 'translationZ', 'scaleX', 'scaleY', 'scaleZ'];

const allGeometryNames: {[type: number]: string} = {
  1: 'Box',
  2: 'Circle',
  3: 'ClosedCone',
  4: 'ClosedCylinder',
  5: 'ClosedEccentricCone',
  6: 'ClosedEllipsoidSegment',
  7: 'ClosedExtrudedRingSegment',
  8: 'ClosedGeneralCylinder',
  9: 'ClosedSphericalSegment',
  10: 'ClosedTorusSegment',
  11: 'Ellipsoid',
  12: 'ExtrudedRing',
  13: 'Nut',
  14: 'OpenCone',
  15: 'OpenCylinder',
  16: 'OpenEccentricCone',
  17: 'OpenEllipsoidSegment',
  18: 'OpenExtrudedRingSegment',
  19: 'OpenGeneralCylinder',
  20: 'OpenSphericalSegment',
  21: 'OpenTorusSegment',
  22: 'Ring',
  23: 'Sphere',
  24: 'Torus',
  100: 'TriangleMesh',
  101: 'InstancedMesh',
};

const specialByteSizes: {[index: string]: number} = {
  'color': 4,
  'normal': 12,
};

const extraGeometryProperties: {[name: string]: string[]} = {
  Box: ['normal', 'deltaX', 'deltaY', 'deltaZ', 'angle'],
  Circle: ['normal', 'radiusA'],
  ClosedCone: ['normal', 'height', 'radiusA', 'radiusB'],
  ClosedCylinder: ['normal', 'height', 'radiusA'],
  ClosedEccentricCone: [],
  ClosedEllipsoidSegment: [],
  ClosedExtrudedRingSegment: [],
  ClosedGeneralCylinder: [],
  ClosedSphericalSegment: [],
  ClosedTorusSegment: [],
  Ellipsoid: [],
  ExtrudedRing: [],
  Nut: [],
  OpenCone: [],
  OpenCylinder: [],
  OpenEccentricCone: [],
  OpenEllipsoidSegment: [],
  OpenExtrudedRingSegment: [],
  OpenGeneralCylinder: [],
  OpenSphericalSegment: [],
  OpenTorusSegment: [],
  Ring: [],
  Sphere: [],
  Torus: [],
  TriangleMesh: [],
  InstancedMesh: [],
};

interface GeometryIndexInformation {
  name: string;
  properties?: string[];
  nodeIds?: NodeIdReader;
  indexes?: FibonacciDecoder;
  geometryCount?: number;
  byteCount?: number;
  attributeCount?: number;
}

interface TrueValues {
  color: THREE.Color[];
  centerX: number[];
  centerY: number[];
  centerZ: number[];
  normal: THREE.Vector3[];
  delta: number[];
  height: number[];
  radius: number[];
  angle: number[];
  translationX: number[];
  translationY: number[];
  translationZ: number[];
  scaleX: number[];
  scaleY: number[];
  scaleZ: number[];
}

interface SectorInformation {
  magicBytes?: number;
  formatVersion?: number;
  optimizerVersion?: number;
  sectorId?: number;
  parentSectorId?: number;
  arrayCount?: number;
  propertyTrueValues: TrueValues;
  geometryIndexes: GeometryIndexInformation[];
}

class NodeIdReader {
  private dataView: DataView;
  private location = 0;

  constructor(arrayBuffer: ArrayBuffer, startLocation: number, lengthBytes: number) {
    this.dataView = new DataView(arrayBuffer, startLocation, lengthBytes);
    this.location = 0;
  }
  // Node ID is saved as a 7 byte integer
  nextNodeId(): number {
    let readValue = 0;
    for (let i = 0; i < 7; i++) {
      readValue += this.dataView.getUint8(this.location + i) << (8 * (6 - i));
    }
    this.location += 7;
    return readValue;
  }
}

export default function readSegmentFile(asArrayBuffer: ArrayBuffer, flip: boolean): SectorInformation {
  const fileReader = new BufferReader(asArrayBuffer, true);
  const sectorInformation: SectorInformation = {
    propertyTrueValues: {
      color: [new THREE.Color()],
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
    geometryIndexes: [],
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

  sectorInformation.geometryIndexes = [];
  while (fileReader.location < asArrayBuffer.byteLength) {
    const name = allGeometryNames[fileReader.readUint32()];
    const newGeometry: GeometryIndexInformation = { name: name };

    // Remaining types are not implemented yet, break early.
    if (newGeometry.name === 'ClosedCylinder') {
      return sectorInformation;
    }

    newGeometry.geometryCount = fileReader.readUint32();
    newGeometry.attributeCount = fileReader.readUint32();
    newGeometry.byteCount = fileReader.readUint32();

    if (newGeometry.attributeCount !== extraGeometryProperties[newGeometry.name].length + 5) {
      throw Error('Incorrect atttibute count for type ' + newGeometry.name + '. Expected ' +
      (extraGeometryProperties[newGeometry.name].length + 5) + ', got ' +
      newGeometry.attributeCount);
    }

    newGeometry.nodeIds = new NodeIdReader(asArrayBuffer, fileReader.location, newGeometry.geometryCount * 7);
    fileReader.skip(newGeometry.geometryCount * 7);

    newGeometry.indexes = new FibonacciDecoder(asArrayBuffer, fileReader.location, newGeometry.byteCount);
    fileReader.skip(newGeometry.byteCount);

    newGeometry.properties = extraGeometryProperties[newGeometry.name];
    sectorInformation.geometryIndexes.push(newGeometry);
  }

  return sectorInformation;
}
