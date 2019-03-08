export type primitiveName = 'Primitive' | 'Box' | 'Circle' | 'Cone' | 'EccentricCone' | 'EllipsoidSegment' |
'GeneralCylinder' |
'GeneralRing' | 'Nut' | 'Quad' | 'SphericalSegment' | 'TorusSegment' | 'Trapezium';
export type propertyName = 'nodeId' | 'treeIndex' | 'color' | 'center' | 'centerA' | 'centerB' | 'radius' | 'radiusA' |
  'radiusB' |
  'hRadius' | 'vRadius' | 'normal' | 'angle' | 'delta' | 'arcAngle' | 'height' | 'heightA' | 'heightB' | 'slopeA' |
  'slopeB' | 'zAngleA' | 'zAngleB' | 'localXAxis' |
  'thickness' | 'transformMatrix' | 'triangleOffset' | 'rotationAngle' | 'triangleCount' | 'vertex1' | 'vertex2' |
  'vertex3' | 'vertex4' | 'planeA' | 'planeB' | 'capNormalA' | 'capNormalB' | 'localXAxis' | 'tubeRadius';

export const primitiveProperties: { [name in primitiveName]: propertyName[]} = {
  Primitive: [],
  Box: ['center', 'normal', 'angle', 'delta'],
  Circle: ['center', 'normal', 'radiusA'],
  Cone: ['centerA', 'centerB', 'radiusA', 'radiusB', 'angle', 'arcAngle', 'localXAxis'],
  EccentricCone: ['centerA', 'centerB', 'radiusA', 'radiusB', 'normal'],
  EllipsoidSegment: ['center', 'normal', 'hRadius', 'vRadius', 'height'],
  GeneralCylinder: ['centerA', 'centerB', 'radiusA', 'heightA', 'heightB', 'slopeA',
    'slopeB', 'zAngleA', 'zAngleB', 'angle', 'arcAngle', 'planeA', 'planeB', 'capNormalA', 'capNormalB', 'localXAxis'],
  GeneralRing: ['center', 'normal', 'radiusA', 'radiusB', 'thickness',
    'angle', 'arcAngle', 'localXAxis'],
  Nut: ['centerA', 'centerB', 'radiusA', 'rotationAngle'],
  Quad: ['vertex1', 'vertex2', 'vertex3'],
  SphericalSegment: ['center', 'normal', 'hRadius', 'height'],
  TorusSegment: ['center', 'normal', 'radius', 'tubeRadius', 'angle', 'arcAngle'],
  Trapezium: ['vertex1', 'vertex2', 'vertex3', 'vertex4'],
};

export const primitiveAttributeProperties: { [name in primitiveName]: propertyName[]} = {
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

export interface AddArgs {
nodeId?: any;
treeIndex?: any;
color?: any;
centerA?: any;
centerB?: any;
radiusA?: any;
radiusB?: any;
normal?: any;
angle?: any;
delta?: any;
arcAngle?: any;
heightA?: any;
heightB?: any;
slopeA?: any;
slopeB?: any;
zAngleA?: any;
zAngleB?: any;
localXAxis?: any;
thickness?: any;
transformMatrix?: any;
triangleOffset?: any;
rotationAngle?: any;
triangleCount?: any;
vertex1?: any;
vertex2?: any;
vertex3?: any;
vertex4?: any;
}

export const float64Properties: propertyName[] = ['nodeId'];
export const float32Properties: propertyName[] =
  ['treeIndex', 'radiusA', 'radiusB', 'angle', 'arcAngle', 'heightA', 'heightB', 'slopeA',
   'slopeB', 'zAngleA', 'zAngleB', 'thickness', 'triangleOffset', 'triangleCount', 'rotationAngle',
   'radius', 'tubeRadius', 'height', 'vRadius', 'hRadius'];
export const vector3Properties: propertyName[] =
  ['centerA', 'centerB', 'normal', 'delta', 'localXAxis', 'vertex1', 'vertex2', 'vertex3', 'vertex4',
   'capNormalA', 'capNormalB', 'center'];
export const vector4Properties: propertyName[] =
  ['planeA', 'planeB'];
export const colorProperties: propertyName[] = ['color'];
export const matrix4Properties: propertyName[] = ['transformMatrix'];