// After making changes to this file, run parserParametersTest to make sure everything is still valid
import * as THREE from 'three';

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
import { addClosedCylinder, addGeneralCylinder, addOpenCylinder } from './unpackGeometry/Cylinder';
import { addClosedEllipsoidSegment, addOpenEllipsoidSegment, addEllipsoid } from './unpackGeometry/Ellipsoid';
import { addClosedTorusSegment, addOpenTorusSegment, addTorus } from './unpackGeometry/Torus';
import { addClosedSphericalSegment, addOpenSphericalSegment } from './unpackGeometry/SphericalSegment';

<<<<<<< HEAD
export type primitiveNames = 'Box' | 'Circle' | 'ClosedCone' | 'ClosedCylinder' | 'ClosedEccentricCone' |
'ClosedEllipsoidSegment' | 'ClosedExtrudedRingSegment' | 'ClosedGeneralCylinder' | 'ClosedSphericalSegment' |
'ClosedTorusSegment' | 'Ellipsoid' | 'ExtrudedRing' | 'Nut' | 'OpenCone' | 'OpenCylinder' | 'OpenEccentricCone' |
'OpenEllipsoidSegment' | 'OpenExtrudedRingSegment' | 'OpenGeneralCylinder' | 'OpenSphericalSegment' |
'OpenTorusSegment' | 'Ring' | 'Sphere' | 'Torus';
export type geometryNames = primitiveNames | 'TriangleMesh' | 'InstancedMesh';

export const filePrimitives: primitiveNames[] = ['Box', 'Circle', 'ClosedCone', 'ClosedCylinder', 'ClosedEccentricCone',
=======
const filePrimitives = ['Box', 'Circle', 'ClosedCone', 'ClosedCylinder', 'ClosedEccentricCone',
>>>>>>> 4b4fd2f7f7f1fa4671d4ff9bd700192a6884c107
'ClosedEllipsoidSegment', 'ClosedExtrudedRingSegment', 'ClosedGeneralCylinder', 'ClosedSphericalSegment',
'ClosedTorusSegment', 'Ellipsoid', 'ExtrudedRing', 'Nut', 'OpenCone', 'OpenCylinder', 'OpenEccentricCone',
'OpenEllipsoidSegment', 'OpenExtrudedRingSegment', 'OpenGeneralCylinder', 'OpenSphericalSegment',
'OpenTorusSegment', 'Ring', 'Sphere', 'Torus'];

<<<<<<< HEAD
export const fileMeshes = ['TriangleMesh', 'InstancedMesh'];
=======
const fileMeshes = ['TriangleMesh', 'InstancedMesh'];
>>>>>>> 4b4fd2f7f7f1fa4671d4ff9bd700192a6884c107

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
  TriangleMesh: ['treeIndex', 'fileId', 'triangleOffset', 'color'],
  InstancedMesh: ['treeIndex', 'fileId', 'triangleOffset', 'triangleCount', 'color', 'translation', 'rotation3',
  'scale'],
};

<<<<<<< HEAD
export const renderedPrimitiveToAddFunction: {[name in primitiveNames]: Function} = {
=======
const renderedPrimitiveToAddFunction: {[name: string]: Function} = {
>>>>>>> 4b4fd2f7f7f1fa4671d4ff9bd700192a6884c107
  'Box': addBox,
  'Circle': addCircle,
  'ClosedCone': addClosedCone,
  'ClosedCylinder': addClosedCylinder,
  'ClosedEccentricCone': addClosedEccentricCone,
  'ClosedEllipsoidSegment': addClosedEllipsoidSegment,
  'ClosedExtrudedRingSegment': addClosedExtrudedRingSegment,
  'ClosedGeneralCylinder': addGeneralCylinder,
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
  'OpenGeneralCylinder': addGeneralCylinder,
  'OpenSphericalSegment': addOpenSphericalSegment,
  'OpenTorusSegment': addOpenTorusSegment,
  'Ring': addRing,
  'Sphere': addSphere,
  'Torus': addTorus,
};

<<<<<<< HEAD
type renderedPrimitiveNames = 'Box' | 'Circle' | 'Cone' | 'EccentricCone' | 'EllipsoidSegment' | 'GeneralCylinder' |
  'GeneralRing' | 'Nut' | 'Quad' | 'SphericalSegment' | 'TorusSegment' | 'Trapezium';
export const renderedPrimitives: renderedPrimitiveNames[] = ['Box', 'Circle', 'Cone', 'EccentricCone',
'EllipsoidSegment', 'GeneralCylinder', 'GeneralRing', 'Nut', 'Quad', 'SphericalSegment', 'TorusSegment', 'Trapezium'];

export const renderedPrimitivesPerFilePrimitive: {[name: string]: string[]} = {
=======
const renderedPrimitives = ['Box', 'Circle', 'Cone', 'EccentricCone', 'EllipsoidSegment', 'GeneralCylinder',
  'GeneralRing', 'Nut', 'Quad', 'SphericalSegment', 'TorusSegment', 'Trapezium'];

const renderedPrimitivesPerFilePrimitive: {[name: string]: string[]} = {
>>>>>>> 4b4fd2f7f7f1fa4671d4ff9bd700192a6884c107
  Box: ['Box'],
  Circle: ['Circle'],
  ClosedCone: ['Circle', 'Circle', 'Cone'],
  ClosedCylinder: ['Circle', 'Circle', 'Cone'],
  ClosedEccentricCone: ['Circle', 'Circle', 'EccentricCone'],
  ClosedEllipsoidSegment: ['EllipsoidSegment', 'Circle'],
  ClosedExtrudedRingSegment: ['Cone', 'Cone', 'GeneralRing', 'GeneralRing', 'Quad', 'Quad'],
  ClosedGeneralCylinder: [/* TODO */],
  ClosedSphericalSegment: ['Circle', 'SphericalSegment'],
  ClosedTorusSegment: ['TorusSegment'],
  Ellipsoid: ['EllipsoidSegment'],
  ExtrudedRing: ['Cone', 'Cone', 'GeneralRing', 'GeneralRing'],
  Nut: ['Nut'],
  OpenCone: ['Cone'],
  OpenCylinder: ['Cone'],
  OpenEccentricCone: ['EccentricCone'],
  OpenEllipsoidSegment: ['EllipsoidSegment'],
  OpenExtrudedRingSegment: ['Cone', 'Cone', 'GeneralRing', 'GeneralRing'],
  OpenGeneralCylinder: [/* TODO */],
  OpenSphericalSegment: ['SphericalSegment'],
  OpenTorusSegment: ['TorusSegment'],
  Ring: ['GeneralRing'],
  Sphere: ['SphericalSegment'],
  Torus: ['TorusSegment'],
};

<<<<<<< HEAD
export const renderedPrimitiveToGroup: {[name: string]: any } = {
=======
const renderedPrimitiveToGroup: {[name: string]: any } = {
>>>>>>> 4b4fd2f7f7f1fa4671d4ff9bd700192a6884c107
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
<<<<<<< HEAD
=======

export { filePropertyArrayNames, filePrimitives, fileMeshes,
  IdToFileGeometryName, fileProperties, fileGeometryProperties,
  renderedPrimitives, renderedPrimitivesPerFilePrimitive, renderedPrimitiveToGroup,
  renderedPrimitiveToAddFunction, BYTES_PER_NODE_ID, DEFAULT_COLOR };
>>>>>>> 4b4fd2f7f7f1fa4671d4ff9bd700192a6884c107
