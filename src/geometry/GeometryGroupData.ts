// Copyright 2019 Cognite AS

import { float64Properties, float32Properties, vector3Properties, matrix4Properties,
  RenderedPrimitiveNameType, primitiveProperties, RenderedPropertyNameType, colorProperties, vector4Properties,
  primitiveAttributes }
  from './GeometryGroupDataParameters';
import * as THREE from 'three';

function getAttributeItemSize(property: RenderedPropertyNameType): number {
  if (float32Properties.indexOf(property) !== -1) {
    return 1;
  } else if (vector3Properties.indexOf(property) !== -1) {
    return 3;
  } else if (vector4Properties.indexOf(property) !== -1) {
    return 4;
  } else if (colorProperties.indexOf(property) !== -1) {
    return 3;
  } else {
    throw Error('Unknown attribute size for property ' + property);
  }
}

export default class GeometryGroupData {
  type: RenderedPrimitiveNameType;
  count: number;
  capacity: number;
  public arrays: {[name: string]: Float64Array | Float32Array };

  constructor(type: RenderedPrimitiveNameType, capacity: number, attributesPointer: any) {
    this.type = type;
    this.count = 0;
    this.capacity = capacity;

    this.arrays = {};
    primitiveProperties[this.type].forEach(property => {
      if (float64Properties.indexOf(property) !== -1) {
        this.arrays[property] = new Float64Array(this.capacity);
      } else if (float32Properties.indexOf(property) !== -1) {
        this.arrays[property] = new Float32Array(this.capacity);
      } else if (vector3Properties.indexOf(property) !== -1) {
        this.arrays[property] = new Float32Array(this.capacity * 3);
      } else if (vector4Properties.indexOf(property) !== -1) {
        this.arrays[property] = new Float32Array(this.capacity * 4);
      } else {
        throw Error('Property ' + property + ' does not have an associated memory structure');
      }
    });

    primitiveAttributes[this.type].forEach(property => {
      attributesPointer.push({
        name: 'a_' + property,
        array: this.arrays[property],
        itemSize: getAttributeItemSize(property),
      });

      if (this.arrays[property] === undefined) {
        throw Error('Primitive attributes issue. Property: ' + property + ', type: ' + this.type);
      }
    });
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
    Object.keys(properties).forEach(property => {
      if (this.arrays[property] === undefined) {
        throw Error('Property ' + (property as string) + ' is not present on groups with type ' +
          (this.type as string) + '. See primitiveProperties in GeometryGroupDataParameters.ts');
      }
      const name = property as RenderedPropertyNameType;
      if (float64Properties.indexOf(name) !== -1 || float32Properties.indexOf(name) !== -1)  {
        this.setNumber(name, properties[property], this.count);
      } else if (vector3Properties.indexOf(name) !== -1) {
        this.setVector3(name, properties[property], this.count);
      } else if (vector4Properties.indexOf(name) !== -1) {
        this.setVector4(name, properties[property], this.count);
      } else {
        throw Error('Property ' + property + ' does not have an associated type. See GeometryGroupDataParameters.ts');
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

  getPropertiesAsObject(index: number) {
    const data: {[name: string]: any} = {};
    Object.keys(this.arrays).forEach(property => {
      const name = property as RenderedPropertyNameType;
      if (float64Properties.indexOf(name) !== -1 || float32Properties.indexOf(name) !== -1)  {
        data[property] = this.getNumber(name, index);
      } else if (vector3Properties.indexOf(name) !== -1) {
        data[property] = this.getVector3(name, new THREE.Vector3(), index);
      } else if (vector4Properties.indexOf(name) !== -1) {
        data[property] = this.getVector4(name, new THREE.Vector4(),  index);
      } else {
        throw Error('Property ' + name + ' does not have an associated memory structure');
      }
    });

    return data;
  }
}
