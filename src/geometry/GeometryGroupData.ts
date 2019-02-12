import { int64Properties, int32Properties, vector3Properties, matrix4Properties,
  primitiveName, primitiveProperties, propertyName, colorProperties, vector4Properties }
  from './GeometryGroupDataParameters';
import * as THREE from 'three';

export default class GeometryGroupData {
  type: primitiveName;
  count: number;
  capacity: number;
  data: {[name: string]: Float64Array | Float32Array };

  constructor(type: primitiveName, capacity: number) {
    this.type = type;
    this.count = 0;
    this.capacity = capacity;

    this.data = {};
    primitiveProperties[this.type].forEach(property => {
      if (int64Properties.indexOf(property) !== -1) {
        this.data[property] = new Float64Array(this.capacity);
      } else if (int32Properties.indexOf(property) !== -1) {
        this.data[property] = new Float32Array(this.capacity);
      } else if (vector3Properties.indexOf(property) !== -1) {
        this.data[property] = new Float32Array(this.capacity * 3);
      } else if (vector4Properties.indexOf(property) !== -1) {
        this.data[property] = new Float32Array(this.capacity * 4);
      } else if (matrix4Properties.indexOf(property) !== -1) {
        this.data[property] = new Float32Array(this.capacity * 16);
      } else if (colorProperties.indexOf(property) !== -1) {
        this.data[property] = new Float32Array(this.capacity * 3);
      } else {
        throw Error('Property ' + property + ' does not have an associated memory structure');
      }
    });
  }

  setNumber(property: propertyName, value: number, index: number) {
    this.data[property][index] = value;
  }

  setVector3(property: propertyName, value: THREE.Vector3, index: number) {
    this.data[property][3 * index] = value.x;
    this.data[property][3 * index + 1] = value.y;
    this.data[property][3 * index + 2] = value.z;
  }

  setVector4(property: propertyName, value: THREE.Vector4, index: number) {
    this.data[property][4 * index] = value.x;
    this.data[property][4 * index + 1] = value.y;
    this.data[property][4 * index + 2] = value.z;
    this.data[property][4 * index + 3] = value.w;
  }

  setMatrix4(property: propertyName, value: THREE.Matrix4, index: number) {
  }

  setColor(source: THREE.Color, index: number) {
    this.data.color[3 * index + 0] = source.r;
    this.data.color[3 * index + 1] = source.g;
    this.data.color[3 * index + 2] = source.b;
  }

  getNumber(property: propertyName, index: number): number {
    return this.data[property][index];
  }

  getVector3(property: propertyName, target: THREE.Vector3, index: number): THREE.Vector3 {
    target.x = this.data[property][3 * index];
    target.y = this.data[property][3 * index + 1];
    target.z = this.data[property][3 * index + 2];
    return target;
  }

  getVector4(property: propertyName, target: THREE.Vector4, index: number): THREE.Vector4 {
    target.x = this.data[property][4 * index];
    target.y = this.data[property][4 * index + 1];
    target.z = this.data[property][4 * index + 2];
    target.w = this.data[property][4 * index + 3];
    return target;
  }

  getMatrix4(property: propertyName, index: number, target: THREE.Matrix4) {
  }

  getColor(target: THREE.Color, index: number): THREE.Color {
    target.setRGB(
      this.data.color[3 * index + 0],
      this.data.color[3 * index + 1],
      this.data.color[3 * index + 2],
    );
    return target;
  }

  add(properties: any) {
    Object.keys(properties).forEach(property => {
      const name = property as propertyName;
      if (int64Properties.indexOf(name) !== -1 || int32Properties.indexOf(name) !== -1)  {
        this.setNumber(name, properties[property], this.count);
      } else if (vector3Properties.indexOf(name) !== -1) {
        this.setVector3(name, properties[property], this.count);
      } else if (vector4Properties.indexOf(name) !== -1) {
        this.setVector4(name, properties[property], this.count);
      } else if (matrix4Properties.indexOf(name) !== -1) {
        this.setMatrix4(name, properties[property], this.count);
      } else if (colorProperties.indexOf(name) !== -1) {
        this.setColor(properties[property], this.count);
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
}
