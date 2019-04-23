// Copyright 2019 Cognite AS

export type RenderedPrimitiveNameType =
  | 'Primitive'
  | 'Box'
  | 'Circle'
  | 'Cone'
  | 'EccentricCone'
  | 'EllipsoidSegment'
  | 'GeneralCylinder'
  | 'GeneralRing'
  | 'Nut'
  | 'Quad'
  | 'SphericalSegment'
  | 'TorusSegment'
  | 'Trapezium';
export const RenderedPrimitiveNames: RenderedPrimitiveNameType[] = [
  'Box',
  'Circle',
  'Cone',
  'EccentricCone',
  'EllipsoidSegment',
  'GeneralCylinder',
  'GeneralRing',
  'Nut',
  'Quad',
  'SphericalSegment',
  'TorusSegment',
  'Trapezium'
];

export type RenderedPropertyNameType =
  | 'nodeId'
  | 'treeIndex'
  | 'color'
  | 'size'
  | 'center'
  | 'centerA'
  | 'centerB'
  | 'radius'
  | 'radiusA'
  | 'radiusB'
  | 'hRadius'
  | 'vRadius'
  | 'normal'
  | 'angle'
  | 'delta'
  | 'arcAngle'
  | 'height'
  | 'heightA'
  | 'heightB'
  | 'slopeA'
  | 'slopeB'
  | 'zAngleA'
  | 'zAngleB'
  | 'localXAxis'
  | 'thickness'
  | 'transformMatrix'
  | 'triangleOffset'
  | 'rotationAngle'
  | 'triangleCount'
  | 'vertex1'
  | 'vertex2'
  | 'vertex3'
  | 'vertex4'
  | 'planeA'
  | 'planeB'
  | 'capNormalA'
  | 'capNormalB'
  | 'localXAxis'
  | 'tubeRadius';

export const primitiveProperties: { [name in RenderedPrimitiveNameType]: RenderedPropertyNameType[] } = {
  Primitive: [],
  Box: ['size', 'center', 'normal', 'angle', 'delta'],
  Circle: ['size', 'center', 'normal', 'radiusA'],
  Cone: ['size', 'centerA', 'centerB', 'radiusA', 'radiusB', 'angle', 'arcAngle', 'localXAxis'],
  EccentricCone: ['size', 'centerA', 'centerB', 'radiusA', 'radiusB', 'normal'],
  EllipsoidSegment: ['size', 'center', 'normal', 'hRadius', 'vRadius', 'height'],
  GeneralCylinder: [
    'size',
    'centerA',
    'centerB',
    'radiusA',
    'heightA',
    'heightB',
    'slopeA',
    'slopeB',
    'zAngleA',
    'zAngleB',
    'angle',
    'arcAngle',
    'planeA',
    'planeB',
    'capNormalA',
    'capNormalB',
    'localXAxis'
  ],
  GeneralRing: ['size', 'center', 'normal', 'radiusA', 'radiusB', 'thickness', 'angle', 'arcAngle', 'localXAxis'],
  Nut: ['size', 'centerA', 'centerB', 'radiusA', 'rotationAngle'],
  Quad: ['size', 'vertex1', 'vertex2', 'vertex3'],
  SphericalSegment: ['size', 'center', 'normal', 'hRadius', 'height'],
  TorusSegment: ['size', 'center', 'normal', 'radius', 'tubeRadius', 'angle', 'arcAngle'],
  Trapezium: ['size', 'vertex1', 'vertex2', 'vertex3', 'vertex4']
};

export const primitiveAttributes: { [name in RenderedPrimitiveNameType]: RenderedPropertyNameType[] } = {
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
  Trapezium: ['vertex1', 'vertex2', 'vertex3', 'vertex4']
};

export const float64Properties: RenderedPropertyNameType[] = ['nodeId'];
export const float32Properties: RenderedPropertyNameType[] = [
  'treeIndex',
  'radiusA',
  'radiusB',
  'angle',
  'arcAngle',
  'heightA',
  'heightB',
  'slopeA',
  'slopeB',
  'zAngleA',
  'zAngleB',
  'thickness',
  'triangleOffset',
  'triangleCount',
  'rotationAngle',
  'radius',
  'tubeRadius',
  'height',
  'vRadius',
  'hRadius',
  'size'
];
export const vector3Properties: RenderedPropertyNameType[] = [
  'centerA',
  'centerB',
  'normal',
  'delta',
  'localXAxis',
  'vertex1',
  'vertex2',
  'vertex3',
  'vertex4',
  'capNormalA',
  'capNormalB',
  'center'
];
export const vector4Properties: RenderedPropertyNameType[] = ['planeA', 'planeB'];
export const colorProperties: RenderedPropertyNameType[] = ['color'];
export const matrix4Properties: RenderedPropertyNameType[] = ['transformMatrix'];
