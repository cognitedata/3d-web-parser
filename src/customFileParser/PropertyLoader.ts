import * as THREE from 'three';
import { CompressedGeometryData, UncompressedValues } from './sharedFileParserTypes';
import { DEFAULT_COLOR, fileGeometryProperties } from './parserParameters';

type CGD = CompressedGeometryData;

// tslint: disable
export default class PropertyLoader {
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
  public rotationAngle = 0;
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
  private values: UncompressedValues;

  private parameterToDataLoadingFunction: { [parameter: string]: Function } = {
    'treeIndex': (geometry: CGD) => { this.treeIndex =               geometry.indexes.nextValue(); },
    'color': (geometry: CGD) => {
      const index = geometry.indexes.nextValue();
      if (index === 0) {
        this.color                              = DEFAULT_COLOR;
      } else {
        this.color                              = this.values.color[index - 1];
      }},
    'center': (geometry: CGD) => {
      const centerX                             = this.values.centerX[geometry.indexes.nextValue()];
      const centerY                             = this.values.centerY[geometry.indexes.nextValue()];
      const centerZ                             = this.values.centerZ[geometry.indexes.nextValue()];
      this.center.set(centerX, centerY, centerZ); },
    'normal': (geometry: CGD) => { this.normal  = this.values.normal [geometry.indexes.nextValue()]; },
    'delta':  (geometry: CGD) => {
      const deltaX                              = this.values.delta  [geometry.indexes.nextValue()];
      const deltaY                              = this.values.delta  [geometry.indexes.nextValue()];
      const deltaZ                              = this.values.delta  [geometry.indexes.nextValue()];
      this.delta.set(deltaX, deltaY, deltaZ);
    },
    'height':        (geometry: CGD) => { this.height          = this.values.height[geometry.indexes.nextValue()]; },
    'radiusA':       (geometry: CGD) => { this.radiusA         = this.values.radius[geometry.indexes.nextValue()]; },
    'radiusB':       (geometry: CGD) => { this.radiusB         = this.values.radius[geometry.indexes.nextValue()]; },
    'capNormal':     (geometry: CGD) => { this.capNormal       = this.values.normal[geometry.indexes.nextValue()]; },
    'arcAngle':      (geometry: CGD) => { this.arcAngle        = this.values.angle [geometry.indexes.nextValue()]; },
    'rotationAngle': (geometry: CGD) => { this.rotationAngle   = this.values.angle [geometry.indexes.nextValue()]; },
    'slopeA':        (geometry: CGD) => { this.slopeA          = this.values.angle [geometry.indexes.nextValue()]; },
    'slopeB':        (geometry: CGD) => { this.slopeB          = this.values.angle [geometry.indexes.nextValue()]; },
    'zAngleA':       (geometry: CGD) => { this.zAngleA         = this.values.angle [geometry.indexes.nextValue()]; },
    'zAngleB':       (geometry: CGD) => { this.zAngleB         = this.values.angle [geometry.indexes.nextValue()]; },
    'rotation3': (geometry: CGD) => {
      const rotationX                           = this.values.angle  [geometry.indexes.nextValue()];
      const rotationY                           = this.values.angle  [geometry.indexes.nextValue()];
      const rotationZ                           = this.values.angle  [geometry.indexes.nextValue()];
      this.rotation3.set(rotationX, rotationY, rotationZ);
    },
    'translation': (geometry: CGD) => {
      const translationX                        = this.values.translationX[geometry.indexes.nextValue()];
      const translationY                        = this.values.translationY[geometry.indexes.nextValue()];
      const translationZ                        = this.values.translationZ[geometry.indexes.nextValue()];
      this.translation.set(translationX, translationY, translationZ);
    },
    'scale': (geometry: CGD) => {
      const scaleX                              = this.values.scaleX[geometry.indexes.nextValue()];
      const scaleY                              = this.values.scaleY[geometry.indexes.nextValue()];
      const scaleZ                              = this.values.scaleZ[geometry.indexes.nextValue()];
      this.scale.set(scaleX, scaleY, scaleZ);
    },
    'triangleOffset': (geometry: CGD) => { this.triangleOffset               = geometry.indexes.nextValue() ; },
    'triangleCount':  (geometry: CGD) => { this.triangleCount                = geometry.indexes.nextValue() ; },
    'thickness':      (geometry: CGD) => { this.thickness = this.values.radius[geometry.indexes.nextValue()]; },
    'fileId':         (geometry: CGD) => { this.fileId    = this.values.fileId[geometry.indexes.nextValue()]; },
  };

  constructor(uncompressedValues: any) {
    this.values = uncompressedValues;
  }

  loadData(geometryInfo: CompressedGeometryData) {
    this.nodeId =    geometryInfo.nodeIds.nextNodeId();
    fileGeometryProperties[geometryInfo.type].forEach(property => {
      this.parameterToDataLoadingFunction[property].call(this, geometryInfo);
    });
  }
}
