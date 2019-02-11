import FibonacciDecoder from './FibonacciDecoder';
import { BYTES_PER_NODE_ID } from './parserParameters';
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

interface GeometryIndexHandler {
  name: string;
  nodeIds: NodeIdReader;
  indexes: FibonacciDecoder;
  count: number;
  byteCount: number;
  attributeCount: number;
}

interface RenderedPrimitiveGroups {
  [name: string]: any;
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
      readValue += this.dataView.getUint8(this.location + i) << (8 * ((BYTES_PER_NODE_ID - 1) - i));
    }
    this.location += BYTES_PER_NODE_ID;
    return readValue;
  }
  rewind() {
    this.location = 0;
  }
}

export { GeometryIndexHandler, SectorMetadata, NodeIdReader, RenderedPrimitiveGroups,
  UncompressedValues, BYTES_PER_NODE_ID };
