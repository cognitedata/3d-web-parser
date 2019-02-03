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
import { MergedMeshMappings } from '../geometry/MergedMeshGroup';
import { InstancedMeshMappings } from '../geometry/InstancedMeshGroup';
import EllipsoidSegmentGroup from '../geometry/EllipsoidSegmentGroup';

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

interface GeometryIndexInformation {
  name: string;
  properties: string[];
  nodeIds: NodeIdReader;
  indexes: FibonacciDecoder;
  geometryCount: number;
  byteCount: number;
  attributeCount: number;
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

class GeometryGroups {
  [name: string]: any;
  public circle: CircleGroup;
  public box: BoxGroup;
  public cone: ConeGroup;
  public eccentricCone: EccentricConeGroup;
  public ellipsoidSegment: EllipsoidSegmentGroup;
  public generalCylinder: GeneralCylinderGroup;
  public generalRing: GeneralRingGroup;
  public nut: NutGroup;
  public quad: QuadGroup;
  public sphericalSegment: SphericalSegmentGroup;
  public torusSegment: TorusSegmentGroup;
  public trapezium: TrapeziumGroup;
  public triangleMesh: MergedMeshMappings;
  public instancedMesh: InstancedMeshMappings;

  constructor(counts: Counts) {
    this.box = new BoxGroup(counts.box);
    this.circle = new CircleGroup(counts.circle);
    this.cone = new ConeGroup(counts.cone);
    this.eccentricCone = new EccentricConeGroup(counts.eccentricCone);
    this.ellipsoidSegment = new EllipsoidSegmentGroup(counts.ellipsoidSegment);
    this.generalCylinder = new GeneralCylinderGroup(counts.generalCylinder);
    this.generalRing = new GeneralRingGroup(counts.generalRing);
    this.nut = new NutGroup(counts.nut);
    this.quad = new QuadGroup(counts.quad);
    this.sphericalSegment = new SphericalSegmentGroup(counts.generalCylinder);
    this.torusSegment = new TorusSegmentGroup(counts.torusSegment);
    this.trapezium = new TrapeziumGroup(counts.trapezium);
    this.triangleMesh = new MergedMeshMappings(counts.triangleMesh);
    this.instancedMesh = new InstancedMeshMappings(counts.instancedMesh);
  }
}

export { propertyNames, allGeometryNames, extraGeometryProperties, GeometryIndexInformation,
  TrueValues, SectorInformation, Counts, GeometryGroups, NodeIdReader};
