// After making changes to this file, run <test> to make sure everything is still valid

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
import { MergedMeshMappings } from '../geometry/MergedMeshGroup';
import { InstancedMeshMappings } from '../geometry/InstancedMeshGroup';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';

import { addBox, addCircle, addNut, addRing, addSphere } from './unpackGeometry/basic';
import { addClosedCone, addClosedEccentricCone, addOpenCone, addOpenEccentricCone } from './unpackGeometry/cone';
import { addExtrudedRing, addClosedExtrudedRingSegment, addOpenExtrudedRingSegment }
  from './unpackGeometry/extrudedRing';
import { addClosedCylinder, addClosedGeneralCylinder, addOpenCylinder, addOpenGeneralCylinder }
  from './unpackGeometry/cylinder';
import { addClosedEllipsoidSegment, addOpenEllipsoidSegment, addEllipsoid } from './unpackGeometry/ellipsoid';
import { addClosedTorusSegment, addOpenTorusSegment, addTorus } from './unpackGeometry/torus';
import { addClosedSphericalSegment, addOpenSphericalSegment } from './unpackGeometry/sphericalSegment';
import { addTriangleMesh, addInstancedMesh } from './unpackGeometry/mesh';

const fileGeometries = ['Box', 'Circle', 'ClosedCone', 'ClosedCylinder', 'ClosedEccentricCone',
'ClosedEllipsoidSegment', 'ClosedExtrudedRingSegment', 'ClosedGeneralCylinder', 'ClosedSphericalSegment',
'ClosedTorusSegment', 'Ellipsoid', 'ExtrudedRing', 'Nut', 'OpenCone', 'OpenCylinder', 'OpenEccentricCone',
'OpenEllipsoidSegment', 'OpenExtrudedRingSegment', 'OpenGeneralCylinder', 'OpenSphericalSegment',
'OpenTorusSegment', 'Ring', 'Sphere', 'Torus', 'TriangleMesh', 'InstancedMesh'];

const IdToFileGeometryName: {[id: number]: string} = {
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

const fileProperties = ['color', 'centerX', 'centerY', 'centerZ', 'normal', 'delta', 'height', 'radius',
'angle', 'translationX', 'translationY', 'translationZ', 'scaleX', 'scaleY', 'scaleZ'];

const fileGeometryProperties: {[name: string]: string[]} = {
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
  TriangleMesh: ['treeIndex', 'fileId', 'triangleOffset', 'triangleCount', 'color'],
  InstancedMesh: ['treeIndex', 'fileId', 'triangleOffset', 'triangleCount', 'color', 'translation', 'rotation3',
  'scale'],
};

const renderedGeometries = ['box', 'circle', 'cone', 'eccentricCone', 'ellipsoidSegment', 'generalCylinder',
  'generalRing', 'nut', 'quad', 'sphericalSegment', 'torusSegment', 'trapezium', 'triangleMesh', 'instancedMesh'];

const renderedGeometriesPerFileGeometry: {[name: string]: string[]} = {
  Box: ['box'],
  Circle: ['circle'],
  ClosedCone: ['circle', 'circle', 'cone'],
  ClosedCylinder: ['circle', 'circle', 'cone'],
  ClosedEccentricCone: ['circle', 'circle', 'eccentricCone'],
  ClosedEllipsoidSegment: ['ellipsoidSegment'],
  ClosedExtrudedRingSegment: ['cone', 'cone', 'generalRing', 'generalRing', 'quad', 'quad'],
  ClosedGeneralCylinder: ['generalCylinder'],
  ClosedSphericalSegment: ['circle', 'sphericalSegment'],
  ClosedTorusSegment: ['torusSegment'],
  Ellipsoid: ['ellipsoidSegment'],
  ExtrudedRing: ['extrudedRing'],
  Nut: ['nut'],
  OpenCone: ['cone'],
  OpenCylinder: ['cone'],
  OpenEccentricCone: ['eccentricCone'],
  OpenEllipsoidSegment: ['openEllipsoidSegment'],
  OpenExtrudedRingSegment: ['cone', 'cone', 'generalRing', 'generalRing'],
  OpenGeneralCylinder: ['generalCylinder'],
  OpenSphericalSegment: ['sphericalSegment'],
  OpenTorusSegment: ['torusSegment'],
  Ring: ['generalRing'],
  Sphere: ['sphericalSegment'],
  Torus: ['torusSegment'],
  TriangleMesh: ['triangleMesh'],
  InstancedMesh: ['instancedMesh'],
};

const renderedGeometryToAddFunction: {[name: string]: Function} = {
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
  'TriangleMesh': addTriangleMesh,
  'InstancedMesh': addInstancedMesh,
};

const renderedGeometryToGroup: {[name: string]: any } = {
  box: BoxGroup,
  circle: CircleGroup,
  cone: ConeGroup,
  eccentricCone: EccentricConeGroup,
  ellipsoidSegment: EllipsoidSegmentGroup,
  generalCylinder: GeneralCylinderGroup,
  generalRing: GeneralRingGroup,
  nut: NutGroup,
  quad: QuadGroup,
  sphericalSegment: SphericalSegmentGroup,
  torusSegment: TorusSegmentGroup,
  trapezium: TrapeziumGroup,
  triangleMesh: MergedMeshMappings,
  instancedMesh: InstancedMeshMappings,
};

export { fileGeometries, IdToFileGeometryName, fileProperties, fileGeometryProperties,
  renderedGeometries, renderedGeometriesPerFileGeometry, renderedGeometryToGroup,
  renderedGeometryToAddFunction };
