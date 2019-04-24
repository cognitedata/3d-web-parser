export type RenderedPrimitiveNameType =
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

export type RenderedMeshNameType = 
  | 'MergedMesh'
  | 'InstancedMesh';

export type RenderedGeometryNameType = RenderedPrimitiveNameType | RenderedMeshNameType;