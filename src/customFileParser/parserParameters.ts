// After making changes to this file, run parserParametersTest to make sure everything is still valid
import * as THREE from 'three';

import PrimitiveGroup from '../geometry/PrimitiveGroup';
import { BoxGroup, CircleGroup, ConeGroup, EccentricConeGroup, GeneralCylinderGroup, GeneralRingGroup,
  NutGroup, QuadGroup, SphericalSegmentGroup, TorusSegmentGroup, TrapeziumGroup, EllipsoidSegmentGroup }
  from '../geometry/GeometryGroups';

import { addBox, addCircle, addNut, addRing, addSphere } from './unpackGeometry/Basic';
import { addClosedCone, addClosedEccentricCone, addOpenCone, addOpenEccentricCone, addOpenGeneralCone,
  addClosedGeneralCone, addSolidOpenGeneralCone, addSolidClosedGeneralCone } from './unpackGeometry/Cone';
import { addExtrudedRing, addClosedExtrudedRingSegment, addOpenExtrudedRingSegment }
  from './unpackGeometry/ExtrudedRing';
import { addOpenCylinder, addClosedCylinder, addOpenGeneralCylinder, addClosedGeneralCylinder,
  addSolidOpenGeneralCylinder, addSolidClosedGeneralCylinder  } from './unpackGeometry/Cylinder';
import { addClosedEllipsoidSegment, addOpenEllipsoidSegment, addEllipsoid } from './unpackGeometry/Ellipsoid';
import { addClosedTorusSegment, addOpenTorusSegment, addTorus } from './unpackGeometry/Torus';
import { addClosedSphericalSegment, addOpenSphericalSegment } from './unpackGeometry/SphericalSegment';

type primitiveNameType = 'Box' | 'Circle' | 'ClosedCone' | 'ClosedCylinder' | 'ClosedEccentricCone' |
  'ClosedEllipsoidSegment' | 'ClosedExtrudedRingSegment' | 'ClosedGeneralCylinder' | 'ClosedSphericalSegment' |
  'ClosedTorusSegment' | 'Ellipsoid' | 'ExtrudedRing' | 'Nut' | 'OpenCone' | 'OpenCylinder' | 'OpenEccentricCone' |
  'OpenEllipsoidSegment' | 'OpenExtrudedRingSegment' | 'OpenGeneralCylinder' | 'OpenSphericalSegment' |
  'OpenTorusSegment' | 'Ring' | 'Sphere' | 'Torus' | 'SolidOpenGeneralCylinder' | 'SolidClosedGeneralCylinder' |
  'OpenGeneralCone' | 'ClosedGeneralCone' | 'SolidOpenGeneralCone' | 'SolidClosedGeneralCone';
type meshNameType = 'MergedMesh' | 'InstancedMesh';
export type geometryNameType = primitiveNameType | meshNameType;

export const filePrimitiveNames: geometryNameType[] = ['Box', 'Circle', 'ClosedCone', 'ClosedCylinder',
  'ClosedEccentricCone', 'ClosedEllipsoidSegment', 'ClosedExtrudedRingSegment', 'ClosedGeneralCylinder',
  'ClosedSphericalSegment', 'ClosedTorusSegment', 'Ellipsoid', 'ExtrudedRing', 'Nut', 'OpenCone',
  'OpenCylinder', 'OpenEccentricCone', 'OpenEllipsoidSegment', 'OpenExtrudedRingSegment',
  'OpenGeneralCylinder', 'OpenSphericalSegment', 'OpenTorusSegment', 'Ring', 'Sphere', 'Torus',
  'SolidOpenGeneralCylinder', 'SolidClosedGeneralCylinder',
  'OpenGeneralCone', 'ClosedGeneralCone', 'SolidOpenGeneralCone', 'SolidClosedGeneralCone'];
export const fileMeshNames: geometryNameType[] = ['MergedMesh', 'InstancedMesh'];

export const IdToFileGeometryName: {[id: number]: geometryNameType} = {
  1: 'Box',
  2: 'Circle',
  3: 'ClosedCone',
  4: 'ClosedCylinder',
  5: 'ClosedEccentricCone',
  6: 'ClosedEllipsoidSegment',
  7: 'ClosedExtrudedRingSegment',
  9: 'ClosedSphericalSegment',
  10: 'ClosedTorusSegment',
  11: 'Ellipsoid',
  12: 'ExtrudedRing',
  13: 'Nut',
  14: 'OpenCone',
  15: 'OpenCylinder',
  16: 'OpenEccentricCone',
  17: 'OpenEllipsoidSegment',
  18: 'OpenExtrudedRingSegment',
  20: 'OpenSphericalSegment',
  21: 'OpenTorusSegment',
  22: 'Ring',
  23: 'Sphere',
  24: 'Torus',
  30: 'OpenGeneralCylinder',
  31: 'ClosedGeneralCylinder',
  32: 'SolidOpenGeneralCylinder',
  33: 'SolidClosedGeneralCylinder',
  34: 'OpenGeneralCone',
  35: 'ClosedGeneralCone',
  36: 'SolidOpenGeneralCone',
  37: 'SolidClosedGeneralCone',
  100: 'MergedMesh',
  101: 'InstancedMesh',
};

export const BYTES_PER_NODE_ID = 7;
export const DEFAULT_COLOR = new THREE.Color(0, 0, 100);

export type filePropertyArrayNameType = 'color' | 'centerX' | 'centerY' | 'centerZ' | 'normal' | 'delta' | 'height' |
  'radius' | 'angle' | 'translationX' | 'translationY' | 'translationZ' | 'scaleX' | 'scaleY' | 'scaleZ' | 'fileId';
export const filePropertyArrayNames: filePropertyArrayNameType[] = ['color', 'centerX', 'centerY', 'centerZ', 'normal',
  'delta', 'height', 'radius', 'angle', 'translationX', 'translationY', 'translationZ', 'scaleX', 'scaleY', 'scaleZ',
  'fileId'];
export type filePropertyNames = 'treeIndex' | 'color' | 'center' | 'normal' | 'delta' | 'height' | 'radiusA' |
  'radiusB' | 'rotationAngle' | 'capNormal' | 'thickness' | 'arcAngle' | 'slopeA' | 'slopeB' | 'zAngleA' | 'zAngleB' |
  'fileId' | 'triangleOffset' | 'translation' | 'rotation3' | 'scale' | 'triangleCount';
export const fileProperties: filePropertyNames[] = ['treeIndex', 'color', 'center', 'normal', 'delta', 'height',
  'radiusA', 'radiusB', 'rotationAngle', 'capNormal', 'thickness', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB',
  'fileId'];

// If adding new parameters, also update PropergeometryNameType
export const fileGeometryProperties: {[name in geometryNameType]: filePropertyNames[]} = {
  Box: ['treeIndex', 'color', 'center', 'normal', 'delta', 'rotationAngle'],
  Circle: ['treeIndex', 'color', 'center', 'normal', 'radiusA'],
  ClosedCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB'],
  ClosedCylinder: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA'],
  ClosedEccentricCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB', 'capNormal'],
  ClosedEllipsoidSegment: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB'],
  ClosedExtrudedRingSegment: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB',
    'rotationAngle', 'arcAngle'],
  ClosedSphericalSegment: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA'],
  ClosedTorusSegment: ['treeIndex', 'color', 'center', 'normal', 'radiusA', 'radiusB', 'rotationAngle', 'arcAngle'],
  Ellipsoid: ['treeIndex', 'color', 'center', 'normal', 'radiusA', 'radiusB'],
  ExtrudedRing: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB'],
  Nut: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'rotationAngle'],
  OpenCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB'],
  OpenCylinder: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA'],
  OpenEccentricCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB', 'capNormal'],
  OpenEllipsoidSegment: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB'],
  OpenExtrudedRingSegment: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB',
    'rotationAngle', 'arcAngle'],
  OpenSphericalSegment: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA'],
  OpenTorusSegment: ['treeIndex', 'color', 'center', 'normal', 'radiusA', 'radiusB', 'rotationAngle', 'arcAngle'],
  Ring: ['treeIndex', 'color', 'center', 'normal', 'radiusA', 'radiusB'],
  Sphere: ['treeIndex', 'color', 'center', 'radiusA'],
  Torus: ['treeIndex', 'color', 'center', 'normal', 'radiusA', 'radiusB'],
  MergedMesh: ['treeIndex', 'fileId', 'triangleCount', 'color'],
  InstancedMesh: ['treeIndex', 'fileId', 'triangleOffset', 'triangleCount', 'color', 'translation', 'rotation3',
  'scale'],
  OpenGeneralCylinder: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA',
  'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
  ClosedGeneralCylinder: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA',
  'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
  SolidOpenGeneralCylinder: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'thickness',
  'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
  SolidClosedGeneralCylinder: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'thickness',
  'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
  OpenGeneralCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB',
  'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
  ClosedGeneralCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB',
  'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
  SolidOpenGeneralCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB', 'thickness',
  'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
  SolidClosedGeneralCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB', 'thickness',
  'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
};

export const renderedPrimitiveToAddFunction: {[name in primitiveNameType]: Function} = {
  'Box': addBox,
  'Circle': addCircle,
  'ClosedCone': addClosedCone,
  'ClosedCylinder': addClosedCylinder,
  'ClosedEccentricCone': addClosedEccentricCone,
  'ClosedEllipsoidSegment': addClosedEllipsoidSegment,
  'ClosedExtrudedRingSegment': addClosedExtrudedRingSegment,
  'ClosedSphericalSegment': addClosedSphericalSegment,
  'ClosedTorusSegment': addClosedTorusSegment,
  'Ellipsoid': addEllipsoid,
  'ExtrudedRing': addExtrudedRing,
  'Nut': addNut,
  'OpenCone': addOpenCone,
  'OpenCylinder': addOpenCylinder,
  'OpenEccentricCone': addOpenEccentricCone,
  'OpenEllipsoidSegment': addOpenEllipsoidSegment,
  'OpenExtrudedRingSegment': addOpenExtrudedRingSegment,
  'OpenSphericalSegment': addOpenSphericalSegment,
  'OpenTorusSegment': addOpenTorusSegment,
  'Ring': addRing,
  'Sphere': addSphere,
  'Torus': addTorus,
  'ClosedGeneralCylinder': addClosedGeneralCylinder,
  'OpenGeneralCylinder': addOpenGeneralCylinder,
  'SolidOpenGeneralCylinder': addSolidOpenGeneralCylinder,
  'SolidClosedGeneralCylinder': addSolidClosedGeneralCylinder,
  'ClosedGeneralCone': addClosedGeneralCone,
  'OpenGeneralCone': addOpenGeneralCone,
  'SolidOpenGeneralCone': addSolidOpenGeneralCone,
  'SolidClosedGeneralCone': addSolidClosedGeneralCone,
};

export type renderedPrimitiveNameType = 'Box' | 'Circle' | 'Cone' | 'EccentricCone' | 'EllipsoidSegment' |
  'GeneralCylinder' | 'GeneralRing' | 'Nut' | 'Quad' | 'SphericalSegment' | 'TorusSegment' | 'Trapezium';
export const renderedPrimitiveNames: renderedPrimitiveNameType[] = ['Box', 'Circle', 'Cone', 'EccentricCone',
  'EllipsoidSegment', 'GeneralCylinder', 'GeneralRing', 'Nut', 'Quad', 'SphericalSegment', 'TorusSegment', 'Trapezium'];

export const renderedPrimitivesPerFilePrimitive:
  {[name: string]: {name: renderedPrimitiveNameType, count: number}[]} = {
  Box: [{ name: 'Box', count: 1 }],
  Circle: [{ name: 'Circle', count: 1 }],
  ClosedCone: [{ name: 'Circle', count: 2 }, { name: 'Cone', count: 1 }],
  ClosedCylinder: [{ name: 'Circle', count: 2 }, { name: 'Cone', count: 1 }],
  ClosedEccentricCone: [{ name: 'Circle', count: 2 }, { name: 'EccentricCone', count: 1 }],
  ClosedEllipsoidSegment: [{ name: 'EllipsoidSegment', count: 1 }, { name: 'Circle', count: 1 }],
  ClosedExtrudedRingSegment: [{ name: 'Cone', count : 2 }, { name: 'GeneralRing', count : 2 },
    { name: 'Quad', count : 2 }],
  ClosedSphericalSegment: [{ name: 'Circle', count: 1 }, { name: 'SphericalSegment', count: 1 }],
  ClosedTorusSegment: [{ name: 'TorusSegment', count: 1 }],
  Ellipsoid: [{ name: 'EllipsoidSegment', count: 1 }],
  ExtrudedRing: [{ name: 'Cone', count : 2 }, { name: 'GeneralRing', count: 2 }],
  Nut: [{ name: 'Nut', count: 1 }],
  OpenCone: [{ name: 'Cone', count: 1 }],
  OpenCylinder: [{ name: 'Cone', count: 1 }],
  OpenEccentricCone: [{ name: 'EccentricCone', count: 1 }],
  OpenEllipsoidSegment: [{ name: 'EllipsoidSegment', count: 1 }],
  OpenExtrudedRingSegment: [{ name: 'Cone', count : 2 }, { name: 'GeneralRing', count: 2 }],
  OpenSphericalSegment: [{ name: 'SphericalSegment', count: 1 }],
  OpenTorusSegment: [{ name: 'TorusSegment', count: 1 }],
  Ring: [{ name: 'GeneralRing', count: 1 }],
  Sphere: [{ name: 'SphericalSegment', count: 1 }],
  Torus: [{ name: 'TorusSegment', count: 1 }],
  ClosedGeneralCylinder: [{ name: 'GeneralCylinder', count : 1 }, { name: 'GeneralRing', count : 2 }],
  OpenGeneralCylinder:  [{ name: 'GeneralCylinder', count : 1 }],
  SolidOpenGeneralCylinder: [{ name: 'GeneralCylinder', count : 2 }, { name: 'GeneralRing', count : 2 }],
  SolidClosedGeneralCylinder: [{ name: 'GeneralCylinder', count : 2 }, { name: 'GeneralRing', count : 2 },
  { name: 'Trapezium', count: 2 }],
  ClosedGeneralCone: [{ name: 'Cone', count : 1 }, { name: 'GeneralRing', count : 2 }],
  OpenGeneralCone:  [{ name: 'Cone', count : 1 }],
  SolidOpenGeneralCone: [{ name: 'Cone', count : 2 }, { name: 'GeneralRing', count : 2 }],
  SolidClosedGeneralCone: [{ name: 'Cone', count : 2 }, { name: 'GeneralRing', count : 2 },
  { name: 'Trapezium', count: 2 }],
};

export const renderedPrimitiveToGroup: {[name: string]: typeof PrimitiveGroup } = {
  Box: BoxGroup,
  Circle: CircleGroup,
  Cone: ConeGroup,
  EccentricCone: EccentricConeGroup,
  EllipsoidSegment: EllipsoidSegmentGroup,
  GeneralCylinder: GeneralCylinderGroup,
  GeneralRing: GeneralRingGroup,
  Nut: NutGroup,
  Quad: QuadGroup,
  SphericalSegment: SphericalSegmentGroup,
  TorusSegment: TorusSegmentGroup,
  Trapezium: TrapeziumGroup,
};
