// Copyright 2019 Cognite AS

import * as THREE from 'three';
import { CompressedGeometryData, UncompressedValues } from './sharedFileParserTypes';
import { DEFAULT_COLOR, fileGeometryProperties } from './parserParameters';
import FibonacciDecoder from '../FibonacciDecoder';

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
    'treeIndex': (indices: FibonacciDecoder) => { this.treeIndex =               indices.nextValue(); },
    'color': (indices: FibonacciDecoder) => {
      const index = indices.nextValue();
      if (index === 0) {
        this.color                              = DEFAULT_COLOR;
      } else {
        this.color                              = this.values.color![index - 1];
      }},
    'center': (indices: FibonacciDecoder) => {
      const centerX                             = this.values.centerX![indices.nextValue()];
      const centerY                             = this.values.centerY![indices.nextValue()];
      const centerZ                             = this.values.centerZ![indices.nextValue()];
      this.center.set(centerX, centerY, centerZ); },
    'normal': (indices: FibonacciDecoder) => { this.normal  = this.values.normal! [indices.nextValue()]; },
    'delta':  (indices: FibonacciDecoder) => {
      const deltaX                              = this.values.delta!  [indices.nextValue()];
      const deltaY                              = this.values.delta!  [indices.nextValue()];
      const deltaZ                              = this.values.delta!  [indices.nextValue()];
      this.delta.set(deltaX, deltaY, deltaZ);
    },
    'height':        (indices: FibonacciDecoder) => { this.height        = this.values.height![indices.nextValue()]; },
    'radiusA':       (indices: FibonacciDecoder) => { this.radiusA       = this.values.radius![indices.nextValue()]; },
    'radiusB':       (indices: FibonacciDecoder) => { this.radiusB       = this.values.radius![indices.nextValue()]; },
    'capNormal':     (indices: FibonacciDecoder) => { this.capNormal     = this.values.normal![indices.nextValue()]; },
    'arcAngle':      (indices: FibonacciDecoder) => { this.arcAngle      = this.values.angle! [indices.nextValue()]; },
    'rotationAngle': (indices: FibonacciDecoder) => { this.rotationAngle = this.values.angle! [indices.nextValue()]; },
    'slopeA':        (indices: FibonacciDecoder) => { this.slopeA        = this.values.angle! [indices.nextValue()]; },
    'slopeB':        (indices: FibonacciDecoder) => { this.slopeB        = this.values.angle! [indices.nextValue()]; },
    'zAngleA':       (indices: FibonacciDecoder) => { this.zAngleA       = this.values.angle! [indices.nextValue()]; },
    'zAngleB':       (indices: FibonacciDecoder) => { this.zAngleB       = this.values.angle! [indices.nextValue()]; },
    'rotation3': (indices: FibonacciDecoder) => {
      const rotationX                           = this.values.angle!  [indices.nextValue()];
      const rotationY                           = this.values.angle!  [indices.nextValue()];
      const rotationZ                           = this.values.angle!  [indices.nextValue()];
      this.rotation3.set(rotationX, rotationY, rotationZ);
    },
    'translation': (indices: FibonacciDecoder) => {
      const translationX                        = this.values.translationX![indices.nextValue()];
      const translationY                        = this.values.translationY![indices.nextValue()];
      const translationZ                        = this.values.translationZ![indices.nextValue()];
      this.translation.set(translationX, translationY, translationZ);
    },
    'scale': (indices: FibonacciDecoder) => {
      const scaleX                              = this.values.scaleX![indices.nextValue()];
      const scaleY                              = this.values.scaleY![indices.nextValue()];
      const scaleZ                              = this.values.scaleZ![indices.nextValue()];
      this.scale.set(scaleX, scaleY, scaleZ);
    },
    'triangleOffset': (indices: FibonacciDecoder) => { this.triangleOffset               = indices.nextValue() ; },
    'triangleCount':  (indices: FibonacciDecoder) => { this.triangleCount                = indices.nextValue() ; },
    'thickness':      (indices: FibonacciDecoder) => { this.thickness = this.values.radius![indices.nextValue()]; },
    'fileId':         (indices: FibonacciDecoder) => { this.fileId    = this.values.fileId![indices.nextValue()]; },
    'diagonalSize':   (indices: FibonacciDecoder) => {
      this.diagonalSize = this.values.diagonalSize![indices.nextValue()]; },
  };

  constructor(uncompressedValues: UncompressedValues) {
    this.values = uncompressedValues;
  }

  loadData(geometryInfo: CompressedGeometryData) {
    this.nodeId =    geometryInfo.nodeIds.nextNodeId();
    fileGeometryProperties[geometryInfo.type].forEach(property => {
      this.parameterToDataLoadingFunction[property].call(this, geometryInfo.indices);
    });
  }
}
