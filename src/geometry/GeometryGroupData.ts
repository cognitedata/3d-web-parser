import { float64Properties, float32Properties, vector3Properties, matrix4Properties,
  primitiveName, primitiveProperties, propertyName, colorProperties, vector4Properties,
  primitiveAttributeProperties }
  from './GeometryGroupDataParameters';
import * as THREE from 'three';

function getAttributeItemSize(property: propertyName): number {
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
  type: primitiveName;
  count: number;
  capacity: number;
  public arrays: {[name: string]: Float64Array | Float32Array };

  constructor(type: primitiveName, capacity: number, attributesPointer: any) {
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
      } else if (colorProperties.indexOf(property) !== -1) {
        this.arrays[property] = new Float32Array(this.capacity * 3);
      } else {
        throw Error('Property ' + property + ' does not have an associated memory structure');
      }
    });

    primitiveAttributeProperties[this.type].forEach(property => {
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

  setNumber(property: propertyName, value: number, index: number) {
    this.arrays[property][index] = value;
  }

  setVector3(property: propertyName, value: THREE.Vector3, index: number) {
    this.arrays[property][3 * index] = value.x;
    this.arrays[property][3 * index + 1] = value.y;
    this.arrays[property][3 * index + 2] = value.z;
  }

  setVector4(property: propertyName, value: THREE.Vector4, index: number) {
    this.arrays[property][4 * index] = value.x;
    this.arrays[property][4 * index + 1] = value.y;
    this.arrays[property][4 * index + 2] = value.z;
    this.arrays[property][4 * index + 3] = value.w;
  }

  getNumber(property: propertyName, index: number): number {
    return this.arrays[property][index];
  }

  getVector3(property: propertyName, target: THREE.Vector3, index: number): THREE.Vector3 {
    target.x = this.arrays[property][3 * index];
    target.y = this.arrays[property][3 * index + 1];
    target.z = this.arrays[property][3 * index + 2];
    return target;
  }

  getVector4(property: propertyName, target: THREE.Vector4, index: number): THREE.Vector4 {
    target.x = this.arrays[property][4 * index];
    target.y = this.arrays[property][4 * index + 1];
    target.z = this.arrays[property][4 * index + 2];
    target.w = this.arrays[property][4 * index + 3];
    return target;
  }

  add(properties: any) {
    Object.keys(properties).forEach(property => {
      const name = property as propertyName;
      if (float64Properties.indexOf(name) !== -1 || float32Properties.indexOf(name) !== -1)  {
        this.setNumber(name, properties[property], this.count);
      } else if (vector3Properties.indexOf(name) !== -1) {
        this.setVector3(name, properties[property], this.count);
      } else if (vector4Properties.indexOf(name) !== -1) {
        this.setVector4(name, properties[property], this.count);
      } else {
        throw Error('Property ' + name + ' does not have an associated memory structure');
      }
    });

    this.count += 1;
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
      }
    });
    return usage;
  }

  asDictionary(index: number) {
    const data: {[name: string]: any} = {};
    Object.keys(this.arrays).forEach(property => {
      const name = property as propertyName;
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
