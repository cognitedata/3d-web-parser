// Copyright 2019 Cognite AS

import {
  float64Properties,
  float32Properties,
  vector3Properties,
  primitiveProperties,
  RenderedPropertyNameType,
  vector4Properties
} from './PrimitiveGroupDataParameters';
import * as THREE from 'three';
import { RenderedPrimitiveNameType } from './Types';
import { assert } from '../utils/assert';
import { ensureCapacityAtLeast32, ensureCapacityAtLeast64, suggestNewCapacity } from '../utils/typedArrayUtils';

export default class PrimitiveGroupData {
  type: RenderedPrimitiveNameType;
  count: number;
  capacity: number;
  public arrays: { [name: string]: Float64Array | Float32Array };

  constructor(type: RenderedPrimitiveNameType, capacity: number) {
    this.type = type;
    this.count = 0;
    this.capacity = capacity;
    this.arrays = {};

    // TODO 20190912 larsmoa: Type per property should be locally defined (by caller) and not by global
    // map with magic constants
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
  }

  setNumber(property: RenderedPropertyNameType, value: number, index: number) {
    this.ensureCapacity(index + 1);
    this.arrays[property][index] = value;
  }

  setVector3(property: RenderedPropertyNameType, value: THREE.Vector3, index: number) {
    this.ensureCapacity(index + 3);
    this.arrays[property][3 * index] = value.x;
    this.arrays[property][3 * index + 1] = value.y;
    this.arrays[property][3 * index + 2] = value.z;
  }

  setVector4(property: RenderedPropertyNameType, value: THREE.Vector4, index: number) {
    this.ensureCapacity(index + 4);
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

    this.count++;
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

  getPropertiesAsObject(index: number, reusableObject?: { [name: string]: any }) {
    const data = reusableObject !== undefined ? reusableObject : {};
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

  consolidateAndOrderBySize() {
    const sizeAndIndex: [number, number][] = [];
    (this.arrays.size as Float32Array).forEach((size, index) => {
      if (index < this.count) {
        sizeAndIndex.push([size, index]);
      }
    });
    const sortedIndices = sizeAndIndex.sort(([size1], [size2]) => size2 - size1).map(([, index]) => index);
    const newArrays: { [propertyName: string]: Float32Array | Float64Array } = {};
    Object.keys(this.arrays).forEach(name => {
      let newArray: Float32Array | Float64Array;
      const property = name as RenderedPropertyNameType;

      // TODO 20190912 larsmoa: Replace iterator-copy below with TypedArray.set()
      if (float64Properties.has(property)) {
        newArray = new Float64Array(this.count);
        sortedIndices.forEach((index, i) => {
          newArray[i] = this.arrays[name][index];
        });
      } else if (float32Properties.has(property)) {
        newArray = new Float32Array(this.count);
        sortedIndices.forEach((index, i) => {
          newArray[i] = this.arrays[name][index];
        });
      } else if (vector3Properties.has(property)) {
        newArray = new Float32Array(this.count * 3);
        sortedIndices.forEach((index, i) => {
          newArray[i * 3] = this.arrays[name][index * 3];
          newArray[i * 3 + 1] = this.arrays[name][index * 3 + 1];
          newArray[i * 3 + 2] = this.arrays[name][index * 3 + 2];
        });
      } else if (vector4Properties.has(property)) {
        newArray = new Float32Array(this.count * 4);
        sortedIndices.forEach((index, i) => {
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

    this.arrays = newArrays;
    this.capacity = this.count;
    return sortedIndices;
  }

  private ensureCapacity(minCapacity: number) {
    if (this.capacity < minCapacity) {
      const newCapacity = suggestNewCapacity(this.capacity, minCapacity);

      for (const property of Object.keys(this.arrays)) {
        const oldArray = this.arrays[property];
        const countPerElement = oldArray.length / this.capacity; // 1, 2, 3 or 4
        assert(
          countPerElement >= 1 && countPerElement <= 4 && Number.isInteger(countPerElement),
          `Expected 1-4 numbers per element, but got ${countPerElement}`
        );

        if (oldArray instanceof Float32Array) {
          this.arrays[property] = ensureCapacityAtLeast32(oldArray, newCapacity * countPerElement);
        } else if (oldArray instanceof Float64Array) {
          this.arrays[property] = ensureCapacityAtLeast64(oldArray, newCapacity * countPerElement);
        } else {
          assert(false, `Unsupported array type '${typeof oldArray}`);
        }
      }
      this.capacity = newCapacity;
    }
  }
}
