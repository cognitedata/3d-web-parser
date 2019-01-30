import BoxGroup from './geometry/BoxGroup';
import CircleGroup from './geometry/CircleGroup';
import ConeGroup from './geometry/ConeGroup';
import * as THREE from 'three';

const lookup = [1, 2];
for (let i = 2; i <= 77; i++) {
  lookup.push(lookup[i - 1] + lookup[i - 2]);
}

class FibonacciDecoder {
  public numberRead: number;

  private buffer: ArrayBuffer;
  private data: Uint8Array;

  private readBitId: number;
  private currentValue: number;
  private nextFibIndex: number;

  constructor(compressedBuffer: ArrayBuffer, startByte?: number, length?: number) {
    if (!startByte) { startByte = 0; }
    if (!length) { length = compressedBuffer.byteLength - startByte; }

    this.numberRead = 0;
    this.buffer = compressedBuffer;
    this.data = new Uint8Array(this.buffer, startByte, length);

    // read first bit
    this.currentValue = (this.data[0] & (1 << 7)) >> 7;
    this.nextFibIndex = 1;
    this.readBitId = 1;
  }

  nextValue() {
    this.numberRead++;
    // read rest of file
    for (let i = 0; i < 100; i++) {
      const currentBit8 = this.data[Math.floor(this.readBitId / 8)] & 1 << (7 - (this.readBitId % 8));
      if (currentBit8 !== 0) {
        // check if termination bit
        const previousBit8 = this.data[Math.floor((this.readBitId - 1) / 8)] & (1 << (7 - (this.readBitId - 1) % 8));
        if ((previousBit8 !== 0) && (this.nextFibIndex !== 0)) {
          const returnValue = this.currentValue - 1;
          this.currentValue = 0;
          this.nextFibIndex = 0;
          this.readBitId++;
          return returnValue;
        } else { // Otherwise update read value
          this.currentValue += lookup[this.nextFibIndex];
        }
      }
      this.nextFibIndex++;
      this.readBitId++;
    }
    throw Error('THIS IS REALLY BAD');
  }
}

class BufferReader {
  public dataView: DataView;
  public location: number;

  private arrayBuffer: ArrayBuffer;
  private flip: boolean;

  constructor(arrayBuffer: ArrayBuffer, flip: boolean) {
    this.arrayBuffer = arrayBuffer;
    this.dataView = new DataView(arrayBuffer);
    this.location = 0;
    // FLIP ONLY IF READING A NODE FILE
    this.flip = Boolean(flip);
  }

  readUint32() {
    this.location += 4;
    return this.dataView.getUint32(this.location - 4, this.flip);
  }

  readUint32Array(numberOfValues: number) {
  const newArray = [];
  for (let i = 0; i < numberOfValues; i++) {
    newArray.push(this.dataView.getUint32(this.location + i * 4, this.flip));
  }
  this.location += numberOfValues * 4;
  return newArray;
  }

  readUint16Array(numberOfValues: number) {
  const newArray = [];
  for (let i = 0; i < numberOfValues; i++) {
    newArray.push(this.dataView.getUint16(this.location + i * 2, this.flip));
  }
  this.location += numberOfValues * 2;
  return newArray;
  }

  readUint8Array(numberOfValues: number) {
  const newArray = [];
  for (let i = 0; i < numberOfValues; i++) {
    newArray.push(this.dataView.getUint8(this.location + i));
  }
  this.location += numberOfValues;
  return newArray;
  }

  readFloat32Array(numberOfValues: number) {
  const newArray = [];
  for (let i = 0; i < numberOfValues; i++) {
    newArray.push(this.dataView.getFloat32(this.location + i * 4, this.flip));
  }
  this.location += numberOfValues * 4;
  return newArray;
  }

  skip(numberOfBytes: number) {
    this.location += numberOfBytes;
  }
}

function parseCustomFileFormat(asArrayBuffer: ArrayBuffer, flip: boolean) {
  const fileReader = new BufferReader(asArrayBuffer, true);

  const infoHeader = fileReader.readUint32Array(4);
  const magicBytes = infoHeader[0];
  const formatVersion = infoHeader[1];
  const optimizerVersion = infoHeader[2];
  const arrayCount = infoHeader[3];

  const arraysList = ['colors', 'x_values', 'y_values', 'z_values', 'normals', 'deltas', 'heights', 'radiuses',
  'angles', 'matrixes', 'x_translations', 'y_translations', 'z_translations'];
  const arraysDictionary: any = {};
  for (let arrayId = 0; arrayId < arrayCount;  arrayId++) {
    const clusterCount = fileReader.readUint32();
    const bytesForOneValue = fileReader.readUint32();
    const type = arraysList[arrayId];

    if ((type === 'colors') && (bytesForOneValue === 4)) {
      const colorValues = fileReader.readUint8Array(clusterCount * 4);
      arraysDictionary[type] = [];
      for (let j = 0; j < clusterCount; j++) {
        arraysDictionary[type].push([]);
        for (let k = 0; k < 4; k++) {
          arraysDictionary[type][j].push(colorValues[j * 4 + k]);
        }
      }
    } else if ((type === 'normals') && (bytesForOneValue === 12)) {
      const normalValues = fileReader.readFloat32Array(clusterCount * 3);
      arraysDictionary[type] = [];
      for (let j = 0; j < clusterCount; j++) {
        const newNormal = new THREE.Vector3(normalValues[j * 3], normalValues[j * 3 + 1], normalValues[j * 3 + 2]);
        arraysDictionary[type].push(newNormal);
      }
    } else if (bytesForOneValue === 4) {
      arraysDictionary[type] = fileReader.readFloat32Array(clusterCount);
    } else {
      throw Error('Well this is unexpected. bytesForOneValue is ' + bytesForOneValue);
    }
  }

  const geometryAttributes = [];
  while (true) {
    const geometryType = fileReader.readUint32();
    const geometryCount = fileReader.readUint32();
    const attributeCount = fileReader.readUint32();
    const byteCount = fileReader.readUint32();

    const indexes = new FibonacciDecoder(asArrayBuffer, fileReader.location, byteCount);
    fileReader.skip(byteCount);

    geometryAttributes.push({'type': geometryType, 'indexes': indexes, 'count': geometryCount,
    'attributeCount': attributeCount});

    if (fileReader.location === asArrayBuffer.byteLength) {
      break;
    }
  }

  return {'magicBytes': magicBytes, 'formatVersion': formatVersion, 'optimizerVersion': optimizerVersion,
  'arrayCount': arrayCount, 'arrays': arraysDictionary, 'geometries': geometryAttributes};
}

let nodeId: number;
let treeIndex: number;
let color: any;
let x: number;
let y: number;
let z: number;
let normal: THREE.Vector3;
let deltaX: number;
let deltaY: number;
let deltaZ: number;
let height: number;
let radius: number;
let radiusA: number;
let radiusB: number;
let angle: number;
const center = new THREE.Vector3();
const delta = new THREE.Vector3();

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

function loadData(trueValuesArray: any, geometryInfo: any) {
  nodeId =    geometryInfo.indexes.nextValue();
  treeIndex = geometryInfo.indexes.nextValue();
  color =     geometryInfo.indexes.nextValue();
  const xIndex = geometryInfo.indexes.nextValue();
  const yIndex = geometryInfo.indexes.nextValue();
  const zIndex = geometryInfo.indexes.nextValue();

  x =         trueValuesArray.x_values[xIndex];
  y =         trueValuesArray.y_values[yIndex];
  z =         trueValuesArray.z_values[zIndex];

  center.set(x, y, z);

  // Normal: All but spheres
  if ([1, 3, 4].indexOf(geometryInfo.type) !== -1) {
    normal = trueValuesArray.normals[geometryInfo.indexes.nextValue()];
  }

  // Delta: Box
  if (geometryInfo.type === 1) {
    deltaX = trueValuesArray.deltas[geometryInfo.indexes.nextValue()];
    deltaY = trueValuesArray.deltas[geometryInfo.indexes.nextValue()];
    deltaZ = trueValuesArray.deltas[geometryInfo.indexes.nextValue()];
    delta.set(deltaX, deltaY, deltaZ);
  }

  // Height: Cylinders and sphere/ellipsoid segments
  if ([3, 4].indexOf(geometryInfo.type) !== -1) {
    height = trueValuesArray.heights[geometryInfo.indexes.nextValue()];
  }

  // Radius (one): Circle, sphere/ellipsoid segment, cylinder
  if ([2, 4].indexOf(geometryInfo.type) !== -1) {
    radius = trueValuesArray.radiuses[geometryInfo.indexes.nextValue()];
  }

  // Radiuses (two): Cones
  if ([3].indexOf(geometryInfo.type) !== -1) {
    radiusA = trueValuesArray.radiuses[geometryInfo.indexes.nextValue()];
    radiusB = trueValuesArray.radiuses[geometryInfo.indexes.nextValue()];
  }

  // Angle: Box
  if ([1].indexOf(geometryInfo.type) !== -1) {
    angle = trueValuesArray.angles[geometryInfo.indexes.nextValue()];
  }

  // Matrix: ??
  // Translation: ??
}

function generateGeometryGroups(segmentInformation: any) {
  let circleCount = 0;
  let boxCount = 0;
  let coneCount = 0;

  for (let i = 0; i < segmentInformation.geometries.length; i++) {
    const geometryInfo = segmentInformation.geometries[i];
    switch (geometryInfo.type) {
      case 1: // Box
        boxCount += geometryInfo.count;
        break;
      case 2: // Circle
        circleCount += geometryInfo.count;
        break;
      case 3: // Closed cone
        circleCount += 2 * geometryInfo.count;
        coneCount += geometryInfo.count;
        break;
      case 4: // Closed cylinder
        circleCount += 2 * geometryInfo.count;
        coneCount += geometryInfo.count;
        break;
      default:
        break;
    }
  }

  const circleGroup = new CircleGroup(circleCount);
  const boxGroup = new BoxGroup(boxCount);
  const coneGroup = new ConeGroup(coneCount);

  for (let i = 0; i < segmentInformation.geometries.length; i++) {
    const geometryInfo = segmentInformation.geometries[i];

    switch (geometryInfo.type) {
      case 1: // Box
        for (let j = 0; j < geometryInfo.count; j++) {
          loadData(segmentInformation.arrays, geometryInfo);
          boxGroup.add(nodeId, treeIndex, color, center, normal, angle, delta);
        }
        break;
      case 2: // Circle
        for (let j = 0; j < geometryInfo.count; j++) {
          loadData(segmentInformation.arrays, geometryInfo);
          circleGroup.add(nodeId, treeIndex, color, center, normal, radius);
        }
        break;
      case 3: // Closed cone
        for (let j = 0; j < geometryInfo.count; j++) {
          loadData(segmentInformation.arrays, geometryInfo);
          centerA.copy(normal).multiplyScalar(height / 2).add(center); // center + normal*height/2
          centerB.copy(normal).multiplyScalar(-height / 2).add(center); // center - normal*height/2
          coneGroup.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, angle);
          circleGroup.add(nodeId, treeIndex, color, centerA, normal, radius);
          circleGroup.add(nodeId, treeIndex, color, centerB, normal, radius);
        }
        break;
      case 4: // Closed cylinder
        for (let j = 0; j < geometryInfo.count; j++) {
          loadData(segmentInformation.arrays, geometryInfo);
          centerA.copy(normal).multiplyScalar(height / 2).add(center); // center + normal*height/2
          centerB.copy(normal).multiplyScalar(-height / 2).add(center); // center - normal*height/2
          coneGroup.add(nodeId, treeIndex, color, centerA, centerB, radius, radius, angle);
          circleGroup.add(nodeId, treeIndex, color, centerA, normal, radius);
          circleGroup.add(nodeId, treeIndex, color, centerB, normal, radius);
        }
        break;
      default:
        break;
    }
  }
  return { 'circleGroup': circleGroup, 'boxGroup': boxGroup, 'coneGroup': coneGroup };
}

export { parseCustomFileFormat, FibonacciDecoder, generateGeometryGroups };
