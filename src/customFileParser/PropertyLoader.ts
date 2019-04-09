import * as THREE from 'three';
import { CompressedGeometryData, UncompressedValues } from './sharedFileParserTypes';
import { DEFAULT_COLOR, fileGeometryProperties } from './parserParameters';

type CGD = CompressedGeometryData;

// tslint: disable
export default class PropertyLoader {
  public nodeId = 0;

  public treeIndex = 0;
  public color = new THREE.Color();
  public diagonalSize = 0;
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
    'treeIndex': (geometry: CGD) => { this.treeIndex =               geometry.indices.nextValue(); },
    'color': (geometry: CGD) => {
      const index = geometry.indices.nextValue();
      if (index === 0) {
        this.color                              = DEFAULT_COLOR;
      } else {
        this.color                              = this.values.color![index - 1];
      }},
    'center': (geometry: CGD) => {
      const centerX                             = this.values.centerX![geometry.indices.nextValue()];
      const centerY                             = this.values.centerY![geometry.indices.nextValue()];
      const centerZ                             = this.values.centerZ![geometry.indices.nextValue()];
      this.center.set(centerX, centerY, centerZ); },
    'normal': (geometry: CGD) => { this.normal  = this.values.normal! [geometry.indices.nextValue()]; },
    'delta':  (geometry: CGD) => {
      const deltaX                              = this.values.delta!  [geometry.indices.nextValue()];
      const deltaY                              = this.values.delta!  [geometry.indices.nextValue()];
      const deltaZ                              = this.values.delta!  [geometry.indices.nextValue()];
      this.delta.set(deltaX, deltaY, deltaZ);
    },
    'height':        (geometry: CGD) => { this.height          = this.values.height![geometry.indices.nextValue()]; },
    'radiusA':       (geometry: CGD) => { this.radiusA         = this.values.radius![geometry.indices.nextValue()]; },
    'radiusB':       (geometry: CGD) => { this.radiusB         = this.values.radius![geometry.indices.nextValue()]; },
    'capNormal':     (geometry: CGD) => { this.capNormal       = this.values.normal![geometry.indices.nextValue()]; },
    'arcAngle':      (geometry: CGD) => { this.arcAngle        = this.values.angle! [geometry.indices.nextValue()]; },
    'rotationAngle': (geometry: CGD) => { this.rotationAngle   = this.values.angle! [geometry.indices.nextValue()]; },
    'slopeA':        (geometry: CGD) => { this.slopeA          = this.values.angle! [geometry.indices.nextValue()]; },
    'slopeB':        (geometry: CGD) => { this.slopeB          = this.values.angle! [geometry.indices.nextValue()]; },
    'zAngleA':       (geometry: CGD) => { this.zAngleA         = this.values.angle! [geometry.indices.nextValue()]; },
    'zAngleB':       (geometry: CGD) => { this.zAngleB         = this.values.angle! [geometry.indices.nextValue()]; },
    'rotation3': (geometry: CGD) => {
      const rotationX                           = this.values.angle!  [geometry.indices.nextValue()];
      const rotationY                           = this.values.angle!  [geometry.indices.nextValue()];
      const rotationZ                           = this.values.angle!  [geometry.indices.nextValue()];
      this.rotation3.set(rotationX, rotationY, rotationZ);
    },
    'translation': (geometry: CGD) => {
      const translationX                        = this.values.translationX![geometry.indices.nextValue()];
      const translationY                        = this.values.translationY![geometry.indices.nextValue()];
      const translationZ                        = this.values.translationZ![geometry.indices.nextValue()];
      this.translation.set(translationX, translationY, translationZ);
    },
    'scale': (geometry: CGD) => {
      const scaleX                              = this.values.scaleX![geometry.indices.nextValue()];
      const scaleY                              = this.values.scaleY![geometry.indices.nextValue()];
      const scaleZ                              = this.values.scaleZ![geometry.indices.nextValue()];
      this.scale.set(scaleX, scaleY, scaleZ);
    },
    'triangleOffset': (geometry: CGD) => { this.triangleOffset               = geometry.indices.nextValue() ; },
    'triangleCount':  (geometry: CGD) => { this.triangleCount                = geometry.indices.nextValue() ; },
    'thickness':      (geometry: CGD) => { this.thickness = this.values.radius![geometry.indices.nextValue()]; },
    'fileId':         (geometry: CGD) => { this.fileId    = this.values.fileId![geometry.indices.nextValue()]; },
    'diagonalSize':   (geometry: CGD) => {
      this.diagonalSize = this.values.diagonalSize![geometry.indices.nextValue()]; },
  };

  constructor(uncompressedValues: UncompressedValues) {
    this.values = uncompressedValues;
  }

  loadData(geometryInfo: CompressedGeometryData) {
    this.nodeId =    geometryInfo.nodeIds.nextNodeId();
    fileGeometryProperties[geometryInfo.type].forEach(property => {
      this.parameterToDataLoadingFunction[property].call(this, geometryInfo);
    });
  }
}
