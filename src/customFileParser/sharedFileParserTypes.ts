import FibonacciDecoder from './FibonacciDecoder';
import { BYTES_PER_NODE_ID, geometryNameType } from './parserParameters';
import * as THREE from 'three';

interface SectorMetadata {
  magicBytes: number;
  formatVersion: number;
  optimizerVersion: number;
  sectorId: number;
  parentSectorId: number;
  arrayCount: number;
  sectorBBoxMin: THREE.Vector3;
  sectorBBoxMax: THREE.Vector3;
}

interface CompressedGeometryData {
  type: geometryNameType;
  nodeIds: NodeIdReader;
  indexes: FibonacciDecoder;
  count: number;
  byteCount: number;
  attributeCount: number;
}

interface UncompressedValues {
  [name: string]: any[];
}

class NodeIdReader {
  private dataView: DataView;
  private location = 0;

  constructor(arrayBuffer: ArrayBuffer, startLocation: number, lengthBytes: number) {
    this.dataView = new DataView(arrayBuffer, startLocation, lengthBytes);
    this.location = 0;
  }
  nextNodeId(): number {
    let readValue = 0;
    for (let i = 0; i < BYTES_PER_NODE_ID; i++) {
      readValue += this.dataView.getUint8(this.location + i) * Math.pow(2, 8 * (BYTES_PER_NODE_ID - 1 - i));
    }
    this.location += BYTES_PER_NODE_ID;
    return readValue;
  }
  rewind() {
    this.location = 0;
  }
}

export { CompressedGeometryData, SectorMetadata, NodeIdReader,
  UncompressedValues, BYTES_PER_NODE_ID };
