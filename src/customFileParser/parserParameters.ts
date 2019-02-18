// After making changes to this file, run parserParametersTest to make sure everything is still valid
import * as THREE from 'three';

import PrimitiveGroup from '../geometry/PrimitiveGroup';
import BoxGroup from '../geometry/BoxGroup';
import CircleGroup from '../geometry/CircleGroup';
import ConeGroup from '../geometry/ConeGroup';
import EccentricConeGroup from '../geometry/EccentricConeGroup';
import GeneralCylinderGroup from '../geometry/GeneralCylinderGroup';
import GeneralRingGroup from '../geometry/GeneralRingGroup';
import NutGroup from '../geometry/NutGroup';
import QuadGroup from '../geometry/QuadGroup';
import SphericalSegmentGroup from '../geometry/SphericalSegmentGroup';
import TorusSegmentGroup from '../geometry/TorusSegmentGroup';
import TrapeziumGroup from '../geometry/TrapeziumGroup';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';

import { addBox, addCircle, addNut, addRing, addSphere } from './unpackGeometry/Basic';
import { addClosedCone, addClosedEccentricCone, addOpenCone, addOpenEccentricCone } from './unpackGeometry/Cone';
import { addExtrudedRing, addClosedExtrudedRingSegment, addOpenExtrudedRingSegment }
  from './unpackGeometry/ExtrudedRing';
import { addClosedCylinder, addClosedGeneralCylinder, addOpenGeneralCylinder, addOpenCylinder }
  from './unpackGeometry/Cylinder';
import { addClosedEllipsoidSegment, addOpenEllipsoidSegment, addEllipsoid } from './unpackGeometry/Ellipsoid';
import { addClosedTorusSegment, addOpenTorusSegment, addTorus } from './unpackGeometry/Torus';
import { addClosedSphericalSegment, addOpenSphericalSegment } from './unpackGeometry/SphericalSegment';

export type primitiveNames = 'Box' | 'Circle' | 'ClosedCone' | 'ClosedCylinder' | 'ClosedEccentricCone' |
'ClosedEllipsoidSegment' | 'ClosedExtrudedRingSegment' | 'ClosedGeneralCylinder' | 'ClosedSphericalSegment' |
'ClosedTorusSegment' | 'Ellipsoid' | 'ExtrudedRing' | 'Nut' | 'OpenCone' | 'OpenCylinder' | 'OpenEccentricCone' |
'OpenEllipsoidSegment' | 'OpenExtrudedRingSegment' | 'OpenGeneralCylinder' | 'OpenSphericalSegment' |
'OpenTorusSegment' | 'Ring' | 'Sphere' | 'Torus';
export type meshNames = 'TriangleMesh' | 'InstancedMesh';
export type geometryNames = primitiveNames | meshNames;

export const filePrimitives: geometryNames[] = ['Box', 'Circle', 'ClosedCone', 'ClosedCylinder', 'ClosedEccentricCone',
'ClosedEllipsoidSegment', 'ClosedExtrudedRingSegment', 'ClosedGeneralCylinder', 'ClosedSphericalSegment',
'ClosedTorusSegment', 'Ellipsoid', 'ExtrudedRing', 'Nut', 'OpenCone', 'OpenCylinder', 'OpenEccentricCone',
'OpenEllipsoidSegment', 'OpenExtrudedRingSegment', 'OpenGeneralCylinder', 'OpenSphericalSegment',
'OpenTorusSegment', 'Ring', 'Sphere', 'Torus'];

export const fileMeshes: geometryNames[] = ['TriangleMesh', 'InstancedMesh'];

export const IdToFileGeometryName: {[id: number]: geometryNames} = {
  1: 'Box',
  2: 'Circle',
  3: 'ClosedCone',
  4: 'ClosedCylinder',
  5: 'ClosedEccentricCone',
  6: 'ClosedEllipsoidSegment',
  7: 'ClosedExtrudedRingSegment',
  8: 'ClosedGeneralCylinder',
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
  19: 'OpenGeneralCylinder',
  20: 'OpenSphericalSegment',
  21: 'OpenTorusSegment',
  22: 'Ring',
  23: 'Sphere',
  24: 'Torus',
  100: 'TriangleMesh',
  101: 'InstancedMesh',
};

export const BYTES_PER_NODE_ID = 7;
export const DEFAULT_COLOR = new THREE.Color(0, 0, 100);

export type filePropertyArrayNames = 'color' | 'centerX' | 'centerY' | 'centerZ' | 'normal' | 'delta' | 'height' |
'radius' | 'angle' | 'translationX' | 'translationY' | 'translationZ' | 'scaleX' | 'scaleY' | 'scaleZ' | 'fileId';
export const filePropertyArrays = ['color', 'centerX', 'centerY', 'centerZ', 'normal', 'delta', 'height',
'radius', 'angle', 'translationX', 'translationY', 'translationZ', 'scaleX', 'scaleY', 'scaleZ', 'fileId'];

export type filePropertyNames = 'treeIndex' | 'color' | 'center' | 'normal' | 'delta' | 'height' | 'radiusA' |
'radiusB' | 'rotationAngle' | 'capNormal' | 'thickness' | 'arcAngle' | 'slopeA' | 'slopeB' | 'zAngleA' | 'zAngleB' |
'fileId' | 'triangleOffset' | 'translation' | 'rotation3' | 'scale' | 'triangleCount';
export const fileProperties: filePropertyNames[] = ['treeIndex', 'color', 'center', 'normal', 'delta', 'height',
'radiusA', 'radiusB', 'rotationAngle', 'capNormal', 'thickness', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB',
'fileId'];

// If adding new parameters, also update PropertyLoader.
export const fileGeometryProperties: {[name in geometryNames]: filePropertyNames[]} = {
  Box: ['treeIndex', 'color', 'center', 'normal', 'delta', 'rotationAngle'],
  Circle: ['treeIndex', 'color', 'center', 'normal', 'radiusA'],
  ClosedCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB'],
  ClosedCylinder: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA'],
  ClosedEccentricCone: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB', 'capNormal'],
  ClosedEllipsoidSegment: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB'],
  ClosedExtrudedRingSegment: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB',
  'rotationAngle', 'arcAngle'],
  ClosedGeneralCylinder: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB', 'thickness',
    'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
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
  OpenGeneralCylinder: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA', 'radiusB', 'thickness',
  'rotationAngle', 'arcAngle', 'slopeA', 'slopeB', 'zAngleA', 'zAngleB'],
  OpenSphericalSegment: ['treeIndex', 'color', 'center', 'normal', 'height', 'radiusA'],
  OpenTorusSegment: ['treeIndex', 'color', 'center', 'normal', 'radiusA', 'radiusB', 'rotationAngle', 'arcAngle'],
  Ring: ['treeIndex', 'color', 'center', 'normal', 'radiusA', 'radiusB'],
  Sphere: ['treeIndex', 'color', 'center', 'radiusA'],
  Torus: ['treeIndex', 'color', 'center', 'normal', 'radiusA', 'radiusB'],
  TriangleMesh: ['treeIndex', 'fileId', 'triangleCount', 'color'],
  InstancedMesh: ['treeIndex', 'fileId', 'triangleOffset', 'triangleCount', 'color', 'translation', 'rotation3',
  'scale'],
};

export const renderedPrimitiveToAddFunction: {[name in primitiveNames]: Function} = {
  'Box': addBox,
  'Circle': addCircle,
  'ClosedCone': addClosedCone,
  'ClosedCylinder': addClosedCylinder,
  'ClosedEccentricCone': addClosedEccentricCone,
  'ClosedEllipsoidSegment': addClosedEllipsoidSegment,
  'ClosedExtrudedRingSegment': addClosedExtrudedRingSegment,
  'ClosedGeneralCylinder': addClosedGeneralCylinder,
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
  'OpenGeneralCylinder': addOpenGeneralCylinder,
  'OpenSphericalSegment': addOpenSphericalSegment,
  'OpenTorusSegment': addOpenTorusSegment,
  'Ring': addRing,
  'Sphere': addSphere,
  'Torus': addTorus,
};

type renderedPrimitiveNames = 'Box' | 'Circle' | 'Cone' | 'EccentricCone' | 'EllipsoidSegment' | 'GeneralCylinder' |
  'GeneralRing' | 'Nut' | 'Quad' | 'SphericalSegment' | 'TorusSegment' | 'Trapezium';
export const renderedPrimitives: renderedPrimitiveNames[] = ['Box', 'Circle', 'Cone', 'EccentricCone',
'EllipsoidSegment', 'GeneralCylinder', 'GeneralRing', 'Nut', 'Quad', 'SphericalSegment', 'TorusSegment', 'Trapezium'];

export const renderedPrimitivesPerFilePrimitive: {[name: string]: {name: renderedPrimitiveNames, count: number}[]} = {
  Box: [{ name: 'Box', count: 1 }],
  Circle: [{ name: 'Circle', count: 1 }],
  ClosedCone: [{ name: 'Circle', count: 2 }, { name: 'Cone', count: 1 }],
  ClosedCylinder: [{ name: 'Circle', count: 2 }, { name: 'Cone', count: 1 }],
  ClosedEccentricCone: [{ name: 'Circle', count: 2 }, { name: 'EccentricCone', count: 1 }],
  ClosedEllipsoidSegment: [{ name: 'EllipsoidSegment', count: 1 }, { name: 'Circle', count: 1 }],
  ClosedExtrudedRingSegment: [{ name: 'Cone', count : 2 }, { name: 'GeneralRing', count : 2 },
    { name: 'Quad', count : 2 }],
  ClosedGeneralCylinder: [{ name: 'GeneralCylinder', count : 2 }, { name: 'Cone', count : 2 },
  { name: 'GeneralRing', count : 2 }, { name: 'Circle', count : 2 }],
  ClosedSphericalSegment: [{ name: 'Circle', count: 1 }, { name: 'SphericalSegment', count: 1 }],
  ClosedTorusSegment: [{ name: 'TorusSegment', count: 1 }],
  Ellipsoid: [{ name: 'EllipsoidSegment', count: 1 }],
  ExtrudedRing: [{ name: 'Cone', count : 2 }, { name: 'GeneralRing', count: 2 }],
  Nut: [{ name: 'Nut', count: 1 }],
  OpenCone: [{ name: 'Cone', count: 1 }],
  OpenCylinder: [{ name: 'Cone', count: 1 }],
  OpenEccentricCone: [{ name: 'EccentricCone', count: 1 }],
  OpenEllipsoidSegment: [{ name: 'EllipsoidSegment', count: 1 }],
  OpenExtrudedRingSegment: [{ name: 'Cone', count : 2 }, { name: 'GeneralRing', count: 1 }],
  OpenGeneralCylinder:  [{ name: 'GeneralCylinder', count : 2 }, { name: 'Cone', count : 2 },
  { name: 'GeneralRing', count : 2 }, { name: 'Circle', count : 2 }],
  OpenSphericalSegment: [{ name: 'SphericalSegment', count: 1 }],
  OpenTorusSegment: [{ name: 'TorusSegment', count: 1 }],
  Ring: [{ name: 'GeneralRing', count: 1 }],
  Sphere: [{ name: 'SphericalSegment', count: 1 }],
  Torus: [{ name: 'TorusSegment', count: 1 }],
};

export const renderedPrimitiveToGroup: {[name: string]: any } = {
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
