// Copyright 2019 Cognite AS

import FibonacciDecoder from '../FibonacciDecoder';
import { BYTES_PER_NODE_ID, geometryNameType } from './parserParameters';
import * as THREE from 'three';

export interface SectorMetadata {
  magicBytes: number;
  formatVersion: number;
  optimizerVersion: number;
  sectorId: number;
  parentSectorId: number;
  arrayCount: number;
  sectorBBoxMin: THREE.Vector3;
  sectorBBoxMax: THREE.Vector3;
}

export interface CompressedGeometryData {
  type: geometryNameType;
  nodeIds: NodeIdReader;
  indices: FibonacciDecoder;
  count: number;
  byteCount: number;
  attributeCount: number;
}

export interface UncompressedValues {
  [propertyName: string]: THREE.Color[] | THREE.Vector3[] | number[] | undefined;
  color?: THREE.Color[];
  normal?: THREE.Vector3[];
  centerX?: number[];
  centerY?: number[];
  centerZ?: number[];
  delta?: number[];
  height?: number[];
  radius?: number[];
  angle?: number[];
  translationX?: number[];
  translationY?: number[];
  translationZ?: number[];
  scaleX?: number[];
  scaleY?: number[];
  scaleZ?: number[];
  fileId?: number[];
}

export type SectorCompressedData = {
  primitives: CompressedGeometryData[],
  instancedMesh?: CompressedGeometryData,
  mergedMesh?: CompressedGeometryData,
};

export type PerSectorCompressedData = {
  [path: string]: SectorCompressedData;
};

export class NodeIdReader {
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
