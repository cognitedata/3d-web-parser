import FibonacciDecoder from './FibonacciDecoder';

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
<<<<<<< HEAD
import { MergedMeshMappings } from '../geometry/MergedMeshGroup';
import { InstancedMeshMappings } from '../geometry/InstancedMeshGroup';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';
=======
>>>>>>> 30f6a6c200fb85fcbe9e7ae9df94c8bec61b658c

const BYTES_PER_NODE_ID = 7;
class NodeIdReader {
  private dataView: DataView;
  private location = 0;

  constructor(arrayBuffer: ArrayBuffer, startLocation: number, lengthBytes: number) {
    this.dataView = new DataView(arrayBuffer, startLocation, lengthBytes);
    this.location = 0;
  }
  // Node ID is saved as a 7 byte integer
  nextNodeId(): number {
    let readValue = 0;
    for (let i = 0; i < BYTES_PER_NODE_ID; i++) {
      readValue += this.dataView.getUint8(this.location + i) << (8 * ((BYTES_PER_NODE_ID - 1) - i));
    }
    this.location += BYTES_PER_NODE_ID;
    return readValue;
  }
}

const propertyNames = ['color', 'centerX', 'centerY', 'centerZ', 'normal', 'delta', 'height', 'radius',
'angle', 'translationX', 'translationY', 'translationZ', 'scaleX', 'scaleY', 'scaleZ'];

const allGeometryNames: {[type: number]: string} = {
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

const extraGeometryProperties: {[name: string]: string[]} = {
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
  TriangleMesh: ['treeIndex', 'fileId'], // 'triangleOffset', 'triangleCount', 'color'],
  InstancedMesh: ['treeIndex', 'fileId', 'triangleOffset', 'triangleCount', 'color', 'translation', 'rotation3'],
  // 'scale'],
};

<<<<<<< HEAD
=======
interface Counts {
  box: number;
  circle: number;
  cone: number;
  eccentricCone: number;
  generalCylinder: number;
  generalRing: number;
  nut: number;
  quad: number;
  sphericalSegment: number;
  torusSegment: number;
  trapezium: number;
}

>>>>>>> 30f6a6c200fb85fcbe9e7ae9df94c8bec61b658c
interface GeometryIndexInformation {
  name: string;
  properties: string[];
  nodeIds: NodeIdReader;
  indexes: FibonacciDecoder;
<<<<<<< HEAD
  geometryCount: number;
  byteCount: number;
  attributeCount: number;
=======
  geometryCount?: number;
  byteCount?: number;
  attributeCount?: number;
>>>>>>> 30f6a6c200fb85fcbe9e7ae9df94c8bec61b658c
}

interface TrueValues {
  color: THREE.Color[];
  centerX: number[];
  centerY: number[];
  centerZ: number[];
  normal: THREE.Vector3[];
  delta: number[];
  height: number[];
  radius: number[];
  angle: number[];
  translationX: number[];
  translationY: number[];
  translationZ: number[];
  scaleX: number[];
  scaleY: number[];
  scaleZ: number[];
}

interface SectorInformation {
  magicBytes?: number;
  formatVersion?: number;
  optimizerVersion?: number;
  sectorId?: number;
  parentSectorId?: number;
  arrayCount?: number;
  propertyTrueValues: TrueValues;
<<<<<<< HEAD
  geometryIndexes: {[name: string]: GeometryIndexInformation };
}

interface Counts {
  box: number;
  circle: number;
  cone: number;
  eccentricCone: number;
  ellipsoidSegment: number;
  generalCylinder: number;
  generalRing: number;
  nut: number;
  quad: number;
  sphericalSegment: number;
  torusSegment: number;
  trapezium: number;
  triangleMesh: number;
  instancedMesh: number;
}

interface GeometryGroups {
  [name: string]: any;
=======
  geometryIndexes: GeometryIndexInformation[];
}

interface GeometryGroups {
>>>>>>> 30f6a6c200fb85fcbe9e7ae9df94c8bec61b658c
  circle: CircleGroup;
  box: BoxGroup;
  cone: ConeGroup;
  eccentricCone: EccentricConeGroup;
<<<<<<< HEAD
  ellipsoidSegment: EllipsoidSegmentGroup;
=======
>>>>>>> 30f6a6c200fb85fcbe9e7ae9df94c8bec61b658c
  generalCylinder: GeneralCylinderGroup;
  generalRing: GeneralRingGroup;
  nut: NutGroup;
  quad: QuadGroup;
  sphericalSegment: SphericalSegmentGroup;
  torusSegment: TorusSegmentGroup;
  trapezium: TrapeziumGroup;
<<<<<<< HEAD
  triangleMesh: MergedMeshMappings;
  instancedMesh: InstancedMeshMappings;
=======
>>>>>>> 30f6a6c200fb85fcbe9e7ae9df94c8bec61b658c
}

export { propertyNames, allGeometryNames, extraGeometryProperties, GeometryIndexInformation,
  TrueValues, SectorInformation, Counts, GeometryGroups, NodeIdReader};
