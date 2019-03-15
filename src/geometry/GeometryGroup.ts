// Copyright 2019 Cognite AS
import * as THREE from 'three';
import GeometryGroupData from './GeometryGroupData';

export interface GeometryNode {
  groupIndex: {collectionIndex?: number, mappingIndex: number};
  treeIndex: number;
  nodeId: number;
  color?: THREE.Color;
  geometryGroup: GeometryGroup;
}

export interface GeometryMap {
  [s: number]: GeometryNode[];
}

export abstract class GeometryGroup {
  public type: string;
  constructor() {
    this.type = '';
  }

  memoryUsage(usage: any) {
    Object.keys(this).forEach(key => {
      // @ts-ignore
      if (ArrayBuffer.isView(this[key])) {
        if (usage.byProperty[key] == null) {
          usage.byProperty[key] = 0;
        }
        if (usage.byGeometry[this.type] == null) {
          usage.byGeometry[this.type] = 0;
        }
        // @ts-ignore
        usage.byGeometry[this.type] += this[key].byteLength;
        // @ts-ignore
        usage.byProperty[key] += this[key].byteLength;
        // @ts-ignore
        usage.total += this[key].byteLength;
      // @ts-ignore
      } else if (this[key] instanceof GeometryGroupData) {
        // @ts-ignore
        this[key].memoryUsage(usage);
      }
    });
    return usage;
  }
}
export default GeometryGroup;
