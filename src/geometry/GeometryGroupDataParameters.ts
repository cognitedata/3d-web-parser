export type primitiveName = 'Box' | 'Circle' | 'Cone' | 'EccentricCone' | 'EllipsoidSegment' | 'GeneralCylinder' |
'GeneralRing' | 'Nut' | 'Quad' | 'SphericalSegment' | 'TorusSegment' | 'Trapezium';
export type propertyName = 'nodeId' | 'treeIndex' | 'color' | 'centerA' | 'centerB' | 'radiusA' |'radiusB' | 'normal' |
  'angle' | 'delta' | 'arcAngle' | 'heightA' | 'heightB' | 'slopeA' | 'slopeB' | 'zAngleA' | 'zAngleB' | 'localXAxis' |
  'thickness' | 'transformMatrix' | 'triangleOffset' | 'rotationAngle' | 'triangleCount' | 'vertex1' | 'vertex2' |
  'vertex3' | 'vertex4' | 'planeA' | 'planeB' | 'capNormalA' | 'capNormalB' | 'localXAxis';

export const primitiveProperties: { [name in primitiveName]: propertyName[]} = {
  Box: ['nodeId', 'treeIndex', 'color', 'centerA', 'normal', 'angle', 'delta'],
  Circle: ['nodeId', 'treeIndex', 'color', 'centerA', 'normal', 'radiusA'],
  Cone: ['nodeId', 'treeIndex', 'color', 'centerA', 'centerB', 'radiusA', 'radiusB', 'angle', 'arcAngle'],
  EccentricCone: ['nodeId', 'treeIndex', 'color', 'centerA', 'centerB', 'radiusA', 'radiusB', 'normal'],
  EllipsoidSegment: ['nodeId', 'treeIndex', 'color', 'centerA', 'normal', 'radiusA', 'radiusB',
  'heightA'], // radiusA: horizontal, radiusB: vertical
  GeneralCylinder: ['nodeId', 'treeIndex', 'color', 'centerA', 'centerB', 'radiusA', 'heightA', 'heightB', 'slopeA',
    'slopeB', 'zAngleA', 'zAngleB', 'angle', 'arcAngle', 'planeA', 'planeB', 'capNormalA', 'capNormalB', 'localXAxis'],
  GeneralRing: ['nodeId', 'treeIndex', 'color', 'centerA', 'normal', 'localXAxis', 'radiusA', 'radiusB', 'thickness',
    'angle', 'arcAngle'], // radiusA: xRadius, radiusB: yRadius
  // InstancedMesh: ['nodeId', 'treeIndex', 'color', 'transformMatrix'],
  // MergedMesh: ['triangleOffset', 'triangleCount', 'nodeId', 'treeIndex', 'color', 'transformMatrix'],
  Nut: ['nodeId', 'treeIndex', 'color', 'centerA', 'centerB', 'radiusA', 'rotationAngle'],
  Quad: ['nodeId', 'treeIndex', 'color', 'vertex1', 'vertex2', 'vertex3'],
  SphericalSegment: ['nodeId', 'treeIndex', 'color', 'centerA', 'normal', 'radiusA', 'heightA'], // radiusB: tubeRadius
  TorusSegment: ['nodeId', 'treeIndex', 'color', 'centerA', 'normal', 'radiusA', 'radiusB', 'angle', 'arcAngle'],
  Trapezium: ['nodeId', 'treeIndex', 'color', 'vertex1', 'vertex2', 'vertex3', 'vertex4'],
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

export const int64Properties: propertyName[] = ['nodeId'];
export const int32Properties: propertyName[] =
  ['nodeId', 'treeIndex', 'radiusA', 'radiusB', 'angle', 'arcAngle', 'heightA', 'heightB', 'slopeA',
   'slopeB', 'zAngleA', 'zAngleB', 'thickness', 'triangleOffset', 'triangleCount', 'rotationAngle'];
export const vector3Properties: propertyName[] =
  ['centerA', 'centerB', 'normal', 'delta', 'localXAxis', 'vertex1', 'vertex2', 'vertex3', 'vertex4',
   'capNormalA', 'capNormalB'];
export const vector4Properties: propertyName[] =
  ['planeA', 'planeB'];
export const colorProperties: propertyName[] = ['color'];
export const matrix4Properties: propertyName[] = ['transformMatrix'];
