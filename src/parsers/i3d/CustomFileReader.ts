// Copyright 2019 Cognite AS

import loadSectorMetadata from './loadSectorMetadata';
import loadUncompressedValues from './loadUncompressedValues';
import loadCompressedGeometryData from './loadCompressedGeometryData';
import FibonacciDecoder from '../FibonacciDecoder';
import { NodeIdReader, CompressedGeometryData, SectorCompressedData } from './sharedFileParserTypes';
import { FilePrimitiveNames, BYTES_PER_NODE_ID, FileGeometryNameType, FilePrimitiveNameType } from './parserParameters';

export default class CustomFileReader {
  public location: number;

  private flip: boolean;
  private originalBuffer: ArrayBuffer;
  private dataView: DataView;

  constructor(arrayBuffer: ArrayBuffer) {
    this.originalBuffer = arrayBuffer;
    this.dataView = new DataView(arrayBuffer);
    this.location = 0;
    // Little endian / big endinan
    this.flip = true;
  }

  // Use for debugging
  dumpHex(numberOfValues: number) {
    for (let i = -numberOfValues; i < 0; i++) {
      // tslint:disable-next-line
      console.log(('00' + this.dataView.getUint8(this.location + i).toString(16)).slice(-2));
    }
    // tslint:disable-next-line
    console.log('~~~');
    for (let i = 0; i < numberOfValues; i++) {
      // tslint:disable-next-line
      console.log(('00' + this.dataView.getUint8(this.location + i).toString(16)).slice(-2));
    }
  }

  readUint8(): number {
    const value = this.dataView.getUint8(this.location);
    this.location += 1;
    return value;
  }

  readUint16(): number {
    const value = this.dataView.getUint16(this.location, this.flip);
    this.location += 2;
    return value;
  }

  readUint32(): number {
    const value = this.dataView.getUint32(this.location, this.flip);
    this.location += 4;
    return value;
  }

  readUint64() {
    let value = this.dataView.getUint32(this.location + 4, this.flip);
    value = value * Math.pow(2, 32);
    value += this.dataView.getUint32(this.location, this.flip);
    this.location += 8;
    return value;
  }

  readFloat32() {
    const value = this.dataView.getFloat32(this.location, this.flip);
    this.location += 4;
    return value;
  }

  readUint32Array(numberOfValues: number): number[] {
    const newArray = [];
    for (let i = 0; i < numberOfValues; i++) {
      newArray.push(this.dataView.getUint32(this.location + i * 4, this.flip));
    }
    this.location += numberOfValues * 4;
    return newArray;
  }

  readUint16Array(numberOfValues: number): number[] {
    const newArray = [];
    for (let i = 0; i < numberOfValues; i++) {
      newArray.push(this.dataView.getUint16(this.location + i * 2, this.flip));
    }
    this.location += numberOfValues * 2;
    return newArray;
  }

  readUint8Array(numberOfValues: number): number[] {
    const newArray = [];
    for (let i = 0; i < numberOfValues; i++) {
      newArray.push(this.dataView.getUint8(this.location + i));
    }
    this.location += numberOfValues;
    return newArray;
  }

  readFloat32Array(numberOfValues: number): number[] {
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

  readSectorMetadata() {
    return loadSectorMetadata(this);
  }

  readUncompressedValues() {
    return loadUncompressedValues(this);
  }

  readCompressedGeometryData(sectorEndLocation: number): SectorCompressedData {
    const geometryDataArray = loadCompressedGeometryData(this, sectorEndLocation);
    const primitives: CompressedGeometryData[] = [];
    let instancedMesh;
    let mergedMesh;
    geometryDataArray.forEach(geometryData => {
      if (FilePrimitiveNames.indexOf(geometryData.type as FilePrimitiveNameType) !== -1) {
        primitives.push(geometryData);
      } else if (geometryData.type === ('InstancedMesh' as FileGeometryNameType)) {
        instancedMesh = geometryData;
      } else if (geometryData.type === ('MergedMesh' as FileGeometryNameType)) {
        mergedMesh = geometryData;
      } else {
        // tslint:disable-next-line:no-console
        console.warn('Unrecognized geometry data type ' + geometryData.type);
      }
    });
    const primitiveHandlers = geometryDataArray.filter(geometryData => {
      return FilePrimitiveNames.indexOf(geometryData.type as FilePrimitiveNameType) !== -1;
    });
    return { primitives: primitiveHandlers, instancedMesh, mergedMesh };
  }

  getNodeIdReader(geometryCount: number): NodeIdReader {
    const nodeIds = new NodeIdReader(this.originalBuffer, this.location, geometryCount * BYTES_PER_NODE_ID);
    this.location += geometryCount * BYTES_PER_NODE_ID;
    return nodeIds;
  }

  getFibonacciDecoder(byteCount: number, numberOfValues: number): FibonacciDecoder {
    const indices = new FibonacciDecoder(this.originalBuffer, numberOfValues, this.location, byteCount);
    this.location += byteCount;
    return indices;
  }
}
