import * as THREE from 'three';
import { GeometryIndexInformation } from './sharedFileParserTypes';

export default class DataLoader {
  public nodeId = 0;

  public treeIndex = 0;
  public color = new THREE.Color();
  public center = new THREE.Vector3();
  public normal = new THREE.Vector3();
  public delta = new THREE.Vector3();
  public height = 0;
  public radiusA = 0;
  public radiusB = 0;
  public capNormal = new THREE.Vector3();
  public rotationalAngle = 0;
  public arcAngle = 0;

  // unique to general cylinder
  public thickness = 0;
  public slopeA = 0;
  public slopeB = 0;
  public zAngleA = 0;
  public zAngleB = 0;

  // unique to triangle and instanced mesh
  public fileId = 0;
  public triangleOffset = 0;
  public triangleCount = 0;
  public translation = new THREE.Vector3();
  public rotation3 = new THREE.Vector3();
  public scale = new THREE.Vector3();

  private trueValuesArray: any;

  constructor(trueValuesArray: any) {
    this.trueValuesArray = trueValuesArray;
  }

  loadData(geometryInfo: GeometryIndexInformation) {
    this.nodeId =    geometryInfo.nodeIds.nextNodeId();

    for (let i = 0; i < geometryInfo.properties.length; i++) {
      const property = geometryInfo.properties[i];
      switch (property) {
        case 'treeIndex':
          this.treeIndex = geometryInfo.indexes.nextValue();
          break;
        case 'center':
          const centerX = this.trueValuesArray.centerX[geometryInfo.indexes.nextValue()];
          const centerY = this.trueValuesArray.centerY[geometryInfo.indexes.nextValue()];
          const centerZ = this.trueValuesArray.centerZ[geometryInfo.indexes.nextValue()];
          this.center.set(centerX, centerY, centerZ);
          break;
        case 'delta':
          const deltaX = this.trueValuesArray.delta[geometryInfo.indexes.nextValue()];
          const deltaY = this.trueValuesArray.delta[geometryInfo.indexes.nextValue()];
          const deltaZ = this.trueValuesArray.delta[geometryInfo.indexes.nextValue()];
          this.delta.set(deltaX, deltaY, deltaZ);
          break;
        case 'rotation3':
          const rotationX = this.trueValuesArray.angle[geometryInfo.indexes.nextValue()];
          const rotationY = this.trueValuesArray.angle[geometryInfo.indexes.nextValue()];
          const rotationZ = this.trueValuesArray.angle[geometryInfo.indexes.nextValue()];
          this.rotation3.set(rotationX, rotationY, rotationZ);
          break;
        case 'translation':
          const translationX = this.trueValuesArray.translationX[geometryInfo.indexes.nextValue()];
          const translationY = this.trueValuesArray.translationY[geometryInfo.indexes.nextValue()];
          const translationZ = this.trueValuesArray.translationZ[geometryInfo.indexes.nextValue()];
          this.translation.set(translationX, translationY, translationZ);
          break;
        case 'scale':
          const scaleX = this.trueValuesArray.scaleX[geometryInfo.indexes.nextValue()];
          const scaleY = this.trueValuesArray.scaleY[geometryInfo.indexes.nextValue()];
          const scaleZ = this.trueValuesArray.scaleZ[geometryInfo.indexes.nextValue()];
          this.scale.set(scaleX, scaleY, scaleZ);
          break;
        case 'radiusA':
        case 'radiusB':
          // @ts-ignore
          this[property] = this.trueValuesArray.radius[geometryInfo.indexes.nextValue()];
          break;
        case 'capNormal':
          this.capNormal = this.trueValuesArray.normal[geometryInfo.indexes.nextValue()];
          break;
        case 'arcAngle':
        case 'rotationAngle':
        case 'slopeA':
        case 'slopeB':
        case 'zAngleA':
        case 'zAngleB':
          // @ts-ignore
          this[property] = this.trueValuesArray.angle[geometryInfo.indexes.nextValue()];
          break;
        case 'fileId':
        case 'triangleOffset':
        case 'triangleCount':
          // @ts-ignore
          this[property] = geometryInfo.indexes.nextValue();
          break;
        case 'thickness':
          this.thickness = this.trueValuesArray.radius[geometryInfo.indexes.nextValue()];
          break;
        default:
          if (Object.getOwnPropertyNames(this).indexOf(property) !== -1) {
            const index = geometryInfo.indexes.nextValue();
            // @ts-ignore
            this[property] = this.trueValuesArray[property][index];
          } else {
            throw Error('Unknown property name ' + property);
          }
      }
    }
  }
}
