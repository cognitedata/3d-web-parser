import BoxGroup from './geometry/BoxGroup'
import CircleGroup from './geometry/CircleGroup'
import ConeGroup from './geometry/ConeGroup'
import * as THREE from 'three';
import { start } from 'repl';

let debug = false;

let lookup = [1,2];
for (let i=2; i<=77; i++) {
  lookup.push(lookup[i-1] + lookup[i-2])
}


class FibonacciDecoder {
  private buffer: ArrayBuffer;
  private data: Uint8Array;
  public numberRead: number;

  private readBitId: number;
  private currentValue: number;
  private nextFibIndex: number;

  constructor(compressedBuffer: ArrayBuffer, startByte?: number, length?: number) {
    if (!startByte) startByte = 0;
    if (!length) length = compressedBuffer.byteLength - startByte;

    this.numberRead = 0;
    this.buffer = compressedBuffer;
    this.data = new Uint8Array(this.buffer, startByte, length);

    // read first bit
    this.currentValue = (this.data[0]&(1<<7))>>7;
    this.nextFibIndex = 1;
    this.readBitId = 1;
  }

  nextValue() {
    this.numberRead++;
    // read rest of file
    //while (true) {
    for (let i=0; i<100; i++) {
      let currentBit8 = this.data[Math.floor(this.readBitId/8)] & 1<<(7-(this.readBitId%8));
      if (currentBit8 != 0) {
        // check if termination bit
        let previousBit8 = this.data[Math.floor((this.readBitId-1)/8)] & (1<<(7-(this.readBitId-1)%8))
        if ((previousBit8 != 0) && (this.nextFibIndex != 0)) {
          let returnValue = this.currentValue-1;
          this.currentValue = 0;
          this.nextFibIndex = 0;
          this.readBitId++;
          return returnValue;
        }

        // Otherwise update read value
        else {
          this.currentValue += lookup[this.nextFibIndex];
        }
      }
      this.nextFibIndex++;
      this.readBitId++;
    }
    throw Error("THIS IS REALLY BAD")
  }
}

function toHex(yourNumber: number): string {
  let hexString = yourNumber.toString(16);
  if (hexString.length % 2) {
    hexString = '0' + hexString;
  }
  return hexString;
}

class BufferReader {
  private arrayBuffer: ArrayBuffer;
  public dataView: DataView;
  public location: number;
  private flip: boolean;

  constructor(arrayBuffer: ArrayBuffer, flip: boolean) {
    this.arrayBuffer = arrayBuffer;
    this.dataView = new DataView(arrayBuffer);
    this.location = 0;
    //FLIP ONLY IF READING A NODE FILE
    this.flip = Boolean(flip);
  }

  readUint32() {
    this.location += 4;
    return this.dataView.getUint32(this.location-4, this.flip)
  }

  readUint32Array(numberOfValues: number) {
  let newArray = [];
  for (let i=0; i<numberOfValues; i++) {
    newArray.push(this.dataView.getUint32(this.location+i*4, this.flip))
  }
  this.location += numberOfValues*4;
  return newArray;
  }

  readUint16Array(numberOfValues: number) {
  let newArray = [];
  for (let i=0; i<numberOfValues; i++) {
    newArray.push(this.dataView.getUint16(this.location+i*2, this.flip))
  }
  this.location += numberOfValues*2;
  return newArray;
  }

  readUint8Array(numberOfValues: number) {
  let newArray = [];
  for (let i=0; i<numberOfValues; i++) {
    newArray.push(this.dataView.getUint8(this.location+i))
  }
  this.location += numberOfValues;
  return newArray;
  }

  readFloat32Array(numberOfValues: number) {
  let newArray = [];
  for (let i=0; i<numberOfValues; i++) {
    newArray.push(this.dataView.getFloat32(this.location+i*4, this.flip))
  }
  this.location += numberOfValues*4;
  return newArray;
  }

  skip(numberOfBytes: number) {
    this.location += numberOfBytes;
  }
}

function parseCustomFileFormat(asArrayBuffer: ArrayBuffer, flip: boolean) {
  let fileReader = new BufferReader(asArrayBuffer, true);
  
  let infoHeader = fileReader.readUint32Array(4);
  let magicBytes = infoHeader[0];
  let formatVersion = infoHeader[1];
  let optimizerVersion = infoHeader[2];
  let arrayCount = infoHeader[3]; 

  if (debug) {
    console.log(magicBytes);
    console.log(toHex(magicBytes));
    console.log(formatVersion);
    console.log(optimizerVersion);
    console.log(arrayCount);
  }

  let arraysList = ['colors', 'x_values', 'y_values', 'z_values', 'normals', 'deltas', 'heights', 'radiuses', 'angles', 'matrixes', 'x_translations', 'y_translations', 'z_translations']
  let arraysDictionary: any = {};
  for (let array_id=0; array_id<arrayCount;  array_id++) {
    let clusterCount = fileReader.readUint32();
    let bytesForOneValue = fileReader.readUint32();
    let type = arraysList[array_id];
    
    if ((type === 'colors') && (bytesForOneValue === 4)) {
      let colorValues = fileReader.readUint8Array(clusterCount*4);
      arraysDictionary[type] = [];
      for (let j=0; j<clusterCount; j++) {
        arraysDictionary[type].push([]);
        for (let k=0; k<4; k++) {
          arraysDictionary[type][j].push(colorValues[j*4+k]);
        }
      }
    } else if ((type === 'normals') && (bytesForOneValue === 12)) {
      let normalValues = fileReader.readFloat32Array(clusterCount*3);
      arraysDictionary[type] = [];
      for (let j=0; j<clusterCount; j++) {
        let normal = new THREE.Vector3(normalValues[j*3], normalValues[j*3+1], normalValues[j*3+2]);
        arraysDictionary[type].push(normal);
      }
    } else if (bytesForOneValue === 4) {
      arraysDictionary[type] = fileReader.readFloat32Array(clusterCount);
    } else {
      console.log("Well this is unexpected. bytesForOneValue is " + bytesForOneValue);
    }
    if (debug) {
      console.log(type)
      console.log(clusterCount);
      console.log(bytesForOneValue);
      console.log(arraysDictionary[type].slice(0,20));
    }
  }

  let geometryAttributes = []
  while (true) {
    let geometryType = fileReader.readUint32();
    let geometryCount = fileReader.readUint32();
    let attributeCount = fileReader.readUint32();
    let byteCount = fileReader.readUint32();

    let indexes = new FibonacciDecoder(asArrayBuffer, fileReader.location, byteCount);
    fileReader.skip(byteCount);

    if (debug) {
      console.log(geometryType);
      console.log(geometryCount);
      console.log(attributeCount);
      console.log(byteCount);
      console.log(indexes);
    }

    geometryAttributes.push({"type": geometryType, "indexes": indexes, "count": geometryCount})

    if (fileReader.location == asArrayBuffer.byteLength) {
      break;
    }
  }

  return {"magicBytes": magicBytes, "formatVersion": formatVersion, "optimizerVersion": optimizerVersion, "arrayCount": arrayCount, "arrays": arraysDictionary, "geometries": geometryAttributes};
}


let nodeId: number;
let treeIndex: number;
let color: any;
let x: number, y: number, z: number;
let delta_x: number, delta_y: number, delta_z: number;
let height: number;
let radius: number, radiusA: number, radiusB: number;
let angle: number;
let center = new THREE.Vector3();
let normal = new THREE.Vector3();
let delta = new THREE.Vector3();

let centerA = new THREE.Vector3();
let centerB = new THREE.Vector3();

function loadData(trueValuesArray: any, geometryInfo: any) {
  nodeId =    geometryInfo.indexes.nextValue();
  treeIndex = geometryInfo.indexes.nextValue();
  color =     geometryInfo.indexes.nextValue();
  let x_index = geometryInfo.indexes.nextValue();
  let y_index = geometryInfo.indexes.nextValue();
  let z_index = geometryInfo.indexes.nextValue();

  x =         trueValuesArray.x_values[x_index];
  y =         trueValuesArray.y_values[y_index];
  z =         trueValuesArray.z_values[z_index];

  center.set(x,y,z);

  // Normal: All but spheres
  if ([1, 3, 4].indexOf(geometryInfo.type) != -1) {
    normal = trueValuesArray.normals[geometryInfo.indexes.nextValue()];
  }

  // Delta: Box
  if (geometryInfo.type == 1) {
    delta_x = trueValuesArray.deltas[geometryInfo.indexes.nextValue()];
    delta_y = trueValuesArray.deltas[geometryInfo.indexes.nextValue()];
    delta_z = trueValuesArray.deltas[geometryInfo.indexes.nextValue()];
    delta.set(delta_x, delta_y, delta_z);
  }
  
  // Height: Cylinders and sphere/ellipsoid segments
  if ([3, 4].indexOf(geometryInfo.type) != -1) {
    height = trueValuesArray.heights[geometryInfo.indexes.nextValue()];
  }
  
  // Radius (one): Circle, sphere/ellipsoid segment, cylinder
  if ([2, 4].indexOf(geometryInfo.type) != -1) {
    radius = trueValuesArray.radiuses[geometryInfo.indexes.nextValue()];
  }


  // Radiuses (two): Cones
  if ([3].indexOf(geometryInfo.type) != -1) {
    radiusA = trueValuesArray.radiuses[geometryInfo.indexes.nextValue()];
    radiusB = trueValuesArray.radiuses[geometryInfo.indexes.nextValue()];    
  }

  // Angle: Box
  if ([1].indexOf(geometryInfo.type) != -1) {
    angle = trueValuesArray.angles[geometryInfo.indexes.nextValue()];
  }

  // Matrix: ??
  // Translation: ??
}

function generateGeometryGroups(segmentInformation: any) {
  let circleCount = 0;
  let boxCount = 0;
  let coneCount = 0;

  for (let i=0; i<segmentInformation.geometries.length; i++) {
    let geometryInfo = segmentInformation.geometries[i];
    switch (geometryInfo.type) {
      case 1: // Box
        boxCount += geometryInfo.count;
        break;
      case 2: // Circle
        circleCount += geometryInfo.count;
        break;
      case 3: // Closed cone
        circleCount += 2*geometryInfo.count;
        coneCount += geometryInfo.count;
        break;
      case 4: // Closed cylinder
        circleCount += 2*geometryInfo.count;
        coneCount += geometryInfo.count;
        break;
      default:
        console.log("Geometry count: Unrecognized geometry with type " + geometryInfo.type)
    }
  }

  let circleGroup = new CircleGroup(circleCount);
  let boxGroup = new BoxGroup(boxCount);
  let coneGroup = new ConeGroup(coneCount);

  for (let i=0; i<segmentInformation.geometries.length; i++) {
    let geometryInfo = segmentInformation.geometries[i];

    switch (geometryInfo.type) {
      case 1: // Box
        for (let j=0; j<geometryInfo.count; j++) {
          loadData(segmentInformation.arrays, geometryInfo);
          boxGroup.add(nodeId, treeIndex, color, center, normal, angle, delta);
        }
        console.log("Boxes done");
        break;
      case 2: // Circle
        for (let j=0; j<geometryInfo.count; j++) {
          loadData(segmentInformation.arrays, geometryInfo);
          circleGroup.add(nodeId, treeIndex, color, center, normal, radius);
        }
        console.log("Circles done");
        break;
      case 3: // Closed cone
        for (let j=0; j<geometryInfo.count; j++) {
          loadData(segmentInformation.arrays, geometryInfo);
          centerA.copy(normal).multiplyScalar(height/2).add(center); // center + normal*height/2
          centerB.copy(normal).multiplyScalar(-height/2).add(center); // center - normal*height/2
          coneGroup.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, angle);
          circleGroup.add(nodeId, treeIndex, color, centerA, normal, radius);
          circleGroup.add(nodeId, treeIndex, color, centerB, normal, radius);
        }
        console.log("Cones done");
        break;
      case 4: // Closed cylinder
        for (let j=0; j<geometryInfo.count; j++) {
          loadData(segmentInformation.arrays, geometryInfo);
          centerA.copy(normal).multiplyScalar(height/2).add(center); // center + normal*height/2
          centerB.copy(normal).multiplyScalar(-height/2).add(center); // center - normal*height/2
          coneGroup.add(nodeId, treeIndex, color, centerA, centerB, radius, radius, angle);
          circleGroup.add(nodeId, treeIndex, color, centerA, normal, radius);
          circleGroup.add(nodeId, treeIndex, color, centerB, normal, radius);
        }
        break;
      default:
        console.log("Geometry parse: Unrecognized geometry with type " + geometryInfo.type)
    }
  }
  return {'circleGroup': circleGroup, 'boxGroup': boxGroup, 'coneGroup': coneGroup}
}

export { parseCustomFileFormat, FibonacciDecoder, generateGeometryGroups }