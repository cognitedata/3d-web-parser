// Copyright 2019 Cognite AS

export type renderedPrimitiveNameType = 'Primitive' | 'Box' | 'Circle' | 'Cone' | 'EccentricCone' | 'EllipsoidSegment' |
  'GeneralCylinder' | 'GeneralRing' | 'Nut' | 'Quad' | 'SphericalSegment' | 'TorusSegment' | 'Trapezium';
export const renderedPrimitiveNames: renderedPrimitiveNameType[] = ['Box', 'Circle', 'Cone', 'EccentricCone',
  'EllipsoidSegment', 'GeneralCylinder', 'GeneralRing', 'Nut', 'Quad', 'SphericalSegment', 'TorusSegment', 'Trapezium'];

export type renderedPropertyNameType = 'nodeId' | 'treeIndex' | 'color' | 'diagonalSize' | 'center' |
  'centerA' | 'centerB'| 'radius' | 'radiusA' |
  'radiusB' | 'hRadius' | 'vRadius' | 'normal' | 'angle' | 'delta' | 'arcAngle' | 'height' | 'heightA' | 'heightB' |
  'slopeA' | 'slopeB' | 'zAngleA' | 'zAngleB' | 'localXAxis' |
  'thickness' | 'transformMatrix' | 'triangleOffset' | 'rotationAngle' | 'triangleCount' | 'vertex1' | 'vertex2' |
  'vertex3' | 'vertex4' | 'planeA' | 'planeB' | 'capNormalA' | 'capNormalB' | 'localXAxis' | 'tubeRadius';

export const primitiveProperties: { [name in renderedPrimitiveNameType]: renderedPropertyNameType[]} = {
  Primitive: [],
  Box: ['diagonalSize', 'center', 'normal', 'angle', 'delta'],
  Circle: ['diagonalSize', 'center', 'normal', 'radiusA'],
  Cone: ['diagonalSize', 'centerA', 'centerB', 'radiusA', 'radiusB', 'angle', 'arcAngle', 'localXAxis'],
  EccentricCone: ['diagonalSize', 'centerA', 'centerB', 'radiusA', 'radiusB', 'normal'],
  EllipsoidSegment: ['diagonalSize', 'center', 'normal', 'hRadius', 'vRadius', 'height'],
  GeneralCylinder: ['diagonalSize', 'centerA', 'centerB', 'radiusA', 'heightA', 'heightB', 'slopeA',
    'slopeB', 'zAngleA', 'zAngleB', 'angle', 'arcAngle', 'planeA', 'planeB', 'capNormalA', 'capNormalB', 'localXAxis'],
  GeneralRing: ['diagonalSize', 'center', 'normal', 'radiusA', 'radiusB', 'thickness', 'angle',
    'arcAngle', 'localXAxis'],
  Nut: ['diagonalSize', 'centerA', 'centerB', 'radiusA', 'rotationAngle'],
  Quad: ['diagonalSize', 'vertex1', 'vertex2', 'vertex3'],
  SphericalSegment: ['diagonalSize', 'center', 'normal', 'hRadius', 'height'],
  TorusSegment: ['diagonalSize', 'center', 'normal', 'radius', 'tubeRadius', 'angle', 'arcAngle'],
  Trapezium: ['diagonalSize', 'vertex1', 'vertex2', 'vertex3', 'vertex4'],
};

export const primitiveAttributes: { [name in renderedPrimitiveNameType]: renderedPropertyNameType[]} = {
  Primitive: [],
  Box: [],
  Circle: [],
  Cone: ['centerA', 'centerB', 'radiusA', 'radiusB', 'localXAxis', 'angle', 'arcAngle'],
  EccentricCone: ['centerA', 'centerB', 'radiusA', 'radiusB', 'normal'],
  EllipsoidSegment: ['center', 'normal', 'hRadius', 'vRadius', 'height'],
  GeneralCylinder: ['centerA', 'centerB', 'planeA', 'planeB', 'localXAxis', 'radiusA', 'angle', 'arcAngle'],
  GeneralRing: ['thickness', 'angle', 'arcAngle'],
  Nut: ['centerA', 'centerB'],
  Quad: [],
  SphericalSegment: ['center', 'normal', 'hRadius', 'height'],
  TorusSegment: ['arcAngle', 'radius', 'tubeRadius'],
  Trapezium: ['vertex1', 'vertex2', 'vertex3', 'vertex4'],
};

export const float64Properties: renderedPropertyNameType[] = ['nodeId'];
export const float32Properties: renderedPropertyNameType[] =
  ['treeIndex', 'radiusA', 'radiusB', 'angle', 'arcAngle', 'heightA', 'heightB', 'slopeA',
    'slopeB', 'zAngleA', 'zAngleB', 'thickness', 'triangleOffset', 'triangleCount', 'rotationAngle',
    'radius', 'tubeRadius', 'height', 'vRadius', 'hRadius', 'diagonalSize'];
export const vector3Properties: renderedPropertyNameType[] = ['centerA', 'centerB', 'normal', 'delta', 'localXAxis',
  'vertex1', 'vertex2', 'vertex3', 'vertex4', 'capNormalA', 'capNormalB', 'center'];
export const vector4Properties: renderedPropertyNameType[] = ['planeA', 'planeB'];
export const colorProperties: renderedPropertyNameType[] = ['color'];
export const matrix4Properties: renderedPropertyNameType[] = ['transformMatrix'];
