import FibonacciDecoder from './FibonacciDecoder';
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
  geometryCount: number;
  byteCount: number;
  attributeCount: number;
}

interface RenderedGeometryGroups {
  [name: string]: any;
}

interface TrueValueArrays {
  [name: string]: any[];
}

const BYTES_PER_NODE_ID = 7;
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
    for (let i = 0; i < BYTES_PER_NODE_ID; i++) {
      readValue += this.dataView.getUint8(this.location + i) << (8 * ((BYTES_PER_NODE_ID - 1) - i));
    }
    this.location += BYTES_PER_NODE_ID;
    return readValue;
  }
}

export { GeometryIndexHandler, SectorMetadata, NodeIdReader, RenderedGeometryGroups,
  TrueValueArrays };
