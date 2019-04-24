// Copyright 2019 Cognite AS

import {
  float64Properties,
  float32Properties,
  vector3Properties,
  primitiveProperties,
  RenderedPropertyNameType,
  colorProperties,
  vector4Properties,
  primitiveAttributes,
} from './PrimitiveGroupDataParameters';
import * as THREE from 'three';
import { RenderedPrimitiveNameType } from './Types';

function getAttributeItemSize(property: RenderedPropertyNameType): number {
  if (float32Properties.has(property)) {
    return 1;
  } else if (vector3Properties.has(property)) {
    return 3;
  } else if (vector4Properties.has(property)) {
    return 4;
  } else if (colorProperties.has(property)) {
    return 3;
  } else {
    throw Error('Unknown attribute size for property ' + property);
  }
}
let t1 = 0;
let t2 = 0;
let t3 = 0;
let t4 = 0;
let t5 = 0;

export default class PrimitiveGroupData {
  type: RenderedPrimitiveNameType;
  count: number;
  capacity: number;
  public arrays: { [name: string]: Float64Array | Float32Array };

  constructor(type: RenderedPrimitiveNameType, capacity: number, attributesPointer?: any) {
    this.type = type;
    this.count = 0;
    this.capacity = capacity;
    this.arrays = {};

    primitiveProperties[this.type].forEach(property => {
      if (float64Properties.has(property)) {
        this.arrays[property] = new Float64Array(this.capacity);
      } else if (float32Properties.has(property)) {
        this.arrays[property] = new Float32Array(this.capacity);
      } else if (vector3Properties.has(property)) {
        this.arrays[property] = new Float32Array(this.capacity * 3);
      } else if (vector4Properties.has(property)) {
        this.arrays[property] = new Float32Array(this.capacity * 4);
      } else {
        throw Error('Property ' + property + ' does not have an associated memory structure');
      }
    });

    if (attributesPointer !== undefined) {
      primitiveAttributes[this.type].forEach(property => {
        attributesPointer.push({
          name: 'a_' + property,
          array: this.arrays[property],
          itemSize: getAttributeItemSize(property)
        });
  
        if (this.arrays[property] === undefined) {
          throw Error('Primitive attributes issue. Property: ' + property + ', type: ' + this.type);
        }
      });
    }
  }

  setNumber(property: RenderedPropertyNameType, value: number, index: number) {
    this.arrays[property][index] = value;
  }

  setVector3(property: RenderedPropertyNameType, value: THREE.Vector3, index: number) {
    this.arrays[property][3 * index] = value.x;
    this.arrays[property][3 * index + 1] = value.y;
    this.arrays[property][3 * index + 2] = value.z;
  }

  setVector4(property: RenderedPropertyNameType, value: THREE.Vector4, index: number) {
    this.arrays[property][4 * index] = value.x;
    this.arrays[property][4 * index + 1] = value.y;
    this.arrays[property][4 * index + 2] = value.z;
    this.arrays[property][4 * index + 3] = value.w;
  }

  getNumber(property: RenderedPropertyNameType, index: number): number {
    return this.arrays[property][index];
  }

  getVector3(property: RenderedPropertyNameType, target: THREE.Vector3, index: number): THREE.Vector3 {
    target.x = this.arrays[property][3 * index];
    target.y = this.arrays[property][3 * index + 1];
    target.z = this.arrays[property][3 * index + 2];
    return target;
  }

  getVector4(property: RenderedPropertyNameType, target: THREE.Vector4, index: number): THREE.Vector4 {
    target.x = this.arrays[property][4 * index];
    target.y = this.arrays[property][4 * index + 1];
    target.z = this.arrays[property][4 * index + 2];
    target.w = this.arrays[property][4 * index + 3];
    return target;
  }

  add(properties: any) {
    Object.keys(properties).forEach(name => {
      if (this.arrays[name] === undefined) {
        throw Error(
          'Property ' +
            (name as string) +
            ' is not present on groups with type ' +
            (this.type as string) +
            '. See primitiveProperties in PrimitiveGroupDataParameters.ts'
        );
      }
      const property = name as RenderedPropertyNameType;
      if (float64Properties.has(property) || float32Properties.has(property)) {
        this.setNumber(property, properties[property], this.count);
      } else if (vector3Properties.has(property)) {
        this.setVector3(property, properties[property], this.count);
      } else if (vector4Properties.has(property)) {
        this.setVector4(property, properties[property], this.count);
      } else {
        throw Error('Property ' + property + ' does not have an associated type. See PrimitiveGroupDataParameters.ts');
      }
    });

    this.count += 1;
  }

  memoryUsage(usage: any) {
    let totalSize = 0;
    Object.keys(this.arrays).forEach(property => {
      const array = this.arrays[property];
      totalSize += array.length * array.BYTES_PER_ELEMENT;
      usage.byProperty[property] = usage.byProperty[property] ? usage.byProperty[property] : 0;
      usage.byProperty[property] += array.length * array.BYTES_PER_ELEMENT;
    });
    usage.byGeometry[this.type] += totalSize;
    usage.total += totalSize;
    return usage;
  }

  getPropertiesAsObject(index: number, reusableObject?: {[name: string]: any}) {
    const data = (reusableObject !== undefined) ? reusableObject : {}; 
    Object.keys(this.arrays).forEach(name => {
      const property = name as RenderedPropertyNameType;
      if (float64Properties.has(property) || float32Properties.has(property)) {
        data[property] = this.getNumber(property, index);
      } else if (vector3Properties.has(property)) {
        data[property] = this.getVector3(property, new THREE.Vector3(), index);
      } else if (vector4Properties.has(property)) {
        data[property] = this.getVector4(property, new THREE.Vector4(), index);
      } else {
        throw Error('Property ' + property + ' does not have an associated memory structure');
      }
    });

    return data;
  }

  sort() {
    // For ivar aasen:
    // 2.5 seconds total to create Array.from()
    // 0.5 seconds to create number[][]
    // 5.5 seonds to sort
    // 2 seconds to get index
    // 7 seconds to create new arrays
    const sizeAndIndex: [number, number][] = [];
    let start = Date.now();
    (this.arrays.size as Float32Array).forEach((size: number, index: number, array: Float32Array) => {(index)
      if (index < this.count) { sizeAndIndex.push([size, index]) };
    });
    t2 += Date.now() - start;
    start = Date.now();
    const three = sizeAndIndex.sort(([size1], [size2]) => size2 - size1);
    t3 += Date.now() - start;
    start = Date.now();
    const sortedIndexes = three.map(([, index]) => index);
    t4 += Date.now() - start;
    start = Date.now();
    const newArrays: any = {};
    Object.keys(this.arrays).forEach(name => {
      let newArray;
      const property = name as RenderedPropertyNameType;
      if (float64Properties.has(property)) {
        newArray = new Float64Array(this.count);
        sortedIndexes.forEach((index, i) => {
          newArray[i] = this.arrays[name][index];
        });
      } else if (float32Properties.has(property)) {
        newArray = new Float32Array(this.count);
        sortedIndexes.forEach((index, i) => {
          newArray[i] = this.arrays[name][index];
        });
      } else if (vector3Properties.has(property)) {
        newArray = new Float32Array(this.count * 3);
        sortedIndexes.forEach((index, i) => {
          newArray[i * 3] = this.arrays[name][index * 3];
          newArray[i * 3 + 1] = this.arrays[name][index * 3 + 1];
          newArray[i * 3 + 2] = this.arrays[name][index * 3 + 2];
        });
      } else if (vector4Properties.has(property)) {
        newArray = new Float32Array(this.count * 4);
        sortedIndexes.forEach((index, i) => {
          newArray[i * 4] = this.arrays[name][index * 4];
          newArray[i * 4 + 1] = this.arrays[name][index * 4 + 1];
          newArray[i * 4 + 2] = this.arrays[name][index * 4 + 2];
          newArray[i * 4 + 3] = this.arrays[name][index * 4 + 3];
        });
      } else {
        throw Error('Property ' + property + ' does not have an associated memory structure');
      }
      newArrays[name] = newArray;
    });
    
    console.log(sortedIndexes);
    t5 += Date.now() - start;
    console.log(t1, t2, t3, t4, t5);
    this.arrays = newArrays;
    this.capacity = this.count;

    return sortedIndexes;
  }
}
