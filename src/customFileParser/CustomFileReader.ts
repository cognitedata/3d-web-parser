
import loadSectorMetadata from './loadSectorMetadata';
import loadTrueValueArrays from './loadTrueValueArrays';
import loadGeometryIndexHandlers from './loadGeometryIndexHandlers';
import FibonacciDecoder from './FibonacciDecoder';
import { NodeIdReader, GeometryIndexHandler } from './sharedFileParserTypes';

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

  readUint32(): number {
    const value = this.dataView.getUint32(this.location, this.flip);
    this.location += 4;
    return value;
  }

  readUint64() {
    let value = this.dataView.getUint32(this.location, this.flip);
    value = value << 8;
    value += this.dataView.getUint32(this.location + 4, this.flip);
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

  readSectorMetadata(sectorByteLength: number) {
    return loadSectorMetadata(this, sectorByteLength);
  }

  readTrueValueArrays() {
    return loadTrueValueArrays(this);
  }

  readSectorGeometryIndexHandlers(sectorEndLocation: number): GeometryIndexHandler[] {
    return loadGeometryIndexHandlers(this, sectorEndLocation);
  }

  getNodeIdReader(geometryCount: number): NodeIdReader {
    const nodeIds = new NodeIdReader(this.originalBuffer, this.location, geometryCount * 7);
    this.location += geometryCount * 7;
    return nodeIds;
  }

  getFibonacciDecoder(byteCount: number): FibonacciDecoder {
    const indexes = new FibonacciDecoder(this.originalBuffer, this.location, byteCount);
    this.location += byteCount;
    return indexes;
  }
}
