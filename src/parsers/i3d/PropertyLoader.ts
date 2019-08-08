// Copyright 2019 Cognite AS

import * as THREE from 'three';
import { CompressedGeometryData, TextureInfo, UncompressedValues } from './sharedFileParserTypes';
import { DEFAULT_COLOR, fileGeometryProperties } from './parserParameters';
import FibonacciDecoder from '../FibonacciDecoder';

export default class PropertyLoader {
  public nodeId = 0;

  public treeIndex = 0;
  public color = new THREE.Color();
  public size = 0;
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
  public diffuseTexture?: TextureInfo;
  public specularTexture?: TextureInfo;
  public ambientTexture?: TextureInfo;
  public normalTexture?: TextureInfo;
  public bumpTexture?: TextureInfo;

  private values: UncompressedValues;

  private parameterToDataLoadingFunction: { [parameter: string]: (indices: FibonacciDecoder) => void } = {
    // tslint:disable:prettier
    treeIndex: indices => { this.treeIndex =               indices.nextValue(); },
    color: indices => {
      const index = indices.nextValue();
      if (index === 0) {
        this.color                              = DEFAULT_COLOR;
      } else {
        this.color                              = this.values.color![index - 1];
      }},
    center: indices => {
      const centerX                             = this.values.centerX![indices.nextValue()];
      const centerY                             = this.values.centerY![indices.nextValue()];
      const centerZ                             = this.values.centerZ![indices.nextValue()];
      this.center.set(centerX, centerY, centerZ); },
    normal: indices => { this.normal  = this.values.normal! [indices.nextValue()]; },
    delta:  indices => {
      const deltaX                              = this.values.delta!  [indices.nextValue()];
      const deltaY                              = this.values.delta!  [indices.nextValue()];
      const deltaZ                              = this.values.delta!  [indices.nextValue()];
      this.delta.set(deltaX, deltaY, deltaZ);
    },
    height:        indices => { this.height        = this.values.height![indices.nextValue()]; },
    radiusA:       indices => { this.radiusA       = this.values.radius![indices.nextValue()]; },
    radiusB:       indices => { this.radiusB       = this.values.radius![indices.nextValue()]; },
    capNormal:     indices => { this.capNormal     = this.values.normal![indices.nextValue()]; },
    arcAngle:      indices => { this.arcAngle      = this.values.angle! [indices.nextValue()]; },
    rotationAngle: indices => { this.rotationAngle = this.values.angle! [indices.nextValue()]; },
    slopeA:        indices => { this.slopeA        = this.values.angle! [indices.nextValue()]; },
    slopeB:        indices => { this.slopeB        = this.values.angle! [indices.nextValue()]; },
    zAngleA:       indices => { this.zAngleA       = this.values.angle! [indices.nextValue()]; },
    zAngleB:       indices => { this.zAngleB       = this.values.angle! [indices.nextValue()]; },
    rotation3: indices => {
      const rotationX                           = this.values.angle!  [indices.nextValue()];
      const rotationY                           = this.values.angle!  [indices.nextValue()];
      const rotationZ                           = this.values.angle!  [indices.nextValue()];
      this.rotation3.set(rotationX, rotationY, rotationZ);
    },
    translation: indices => {
      const translationX                        = this.values.translationX![indices.nextValue()];
      const translationY                        = this.values.translationY![indices.nextValue()];
      const translationZ                        = this.values.translationZ![indices.nextValue()];
      this.translation.set(translationX, translationY, translationZ);
    },
    scale: indices => {
      const scaleX                              = this.values.scaleX![indices.nextValue()];
      const scaleY                              = this.values.scaleY![indices.nextValue()];
      const scaleZ                              = this.values.scaleZ![indices.nextValue()];
      this.scale.set(scaleX, scaleY, scaleZ);
    },
    triangleOffset: indices => { this.triangleOffset               = indices.nextValue() ; },
    triangleCount:  indices => { this.triangleCount                = indices.nextValue() ; },
    thickness:      indices => { this.thickness = this.values.radius![indices.nextValue()]; },
    fileId:         indices => { this.fileId    = this.values.fileId![indices.nextValue()]; },
    size:   indices => {
      this.size = this.values.size![indices.nextValue()]; },
    diffuseTexture:   indices => { this.diffuseTexture  = this.values.texture![indices.nextValue() - 1]; },
    specularTexture:  indices => { this.specularTexture = this.values.texture![indices.nextValue() - 1]; },
    ambientTexture:   indices => { this.ambientTexture  = this.values.texture![indices.nextValue() - 1]; },
    normalTexture:    indices => { this.normalTexture   = this.values.texture![indices.nextValue() - 1]; },
    bumpTexture:      indices => { this.bumpTexture     = this.values.texture![indices.nextValue() - 1]; },
    // tslint:enable:prettier
  };

  constructor(uncompressedValues: UncompressedValues) {
    this.values = uncompressedValues;
  }

  loadData(geometryInfo: CompressedGeometryData) {
    this.nodeId = geometryInfo.nodeIds.nextNodeId();
    fileGeometryProperties[geometryInfo.type].forEach(property => {
      this.parameterToDataLoadingFunction[property].call(this, geometryInfo.indices);
    });
  }
}
