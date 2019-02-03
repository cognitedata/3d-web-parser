import * as THREE from 'three';

import { propertyNames, GeometryGroups } from './sharedFileParserTypes';
import countGeometries from './countGeometries';
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

import DataLoader from './DataLoader';

export default function generateGeometryGroups(segmentInformation: any) {
  const counts = countGeometries(segmentInformation);

  const groups: GeometryGroups = {
    box: new BoxGroup(counts.box),
    circle: new CircleGroup(counts.circle),
    cone: new ConeGroup(counts.cone),
    eccentricCone: new EccentricConeGroup(counts.eccentricCone),
    generalCylinder: new GeneralCylinderGroup(counts.generalCylinder),
    generalRing: new GeneralRingGroup(counts.generalRing),
    nut: new NutGroup(counts.nut),
    quad: new QuadGroup(counts.quad),
    sphericalSegment: new SphericalSegmentGroup(counts.generalCylinder),
    torusSegment: new TorusSegmentGroup(counts.torusSegment),
    trapezium: new TrapeziumGroup(counts.trapezium),
    triangleMesh: new MergedMeshMappings(counts.triangleMesh),
    instancedMesh: new InstancedMeshMappings(counts.instancedMesh),
  };

  const data = new DataLoader(segmentInformation.propertyTrueValues);
  const centerA = new THREE.Vector3();
  const centerB = new THREE.Vector3();

  for (let i = 0; i < segmentInformation.geometryIndexes.length; i++) {
    const geometryInfo = segmentInformation.geometryIndexes[i];

    for (let j = 0; j < geometryInfo.geometryCount; j++) {
      data.loadData(geometryInfo);
      switch (geometryInfo.name) {
        case 'Box':
          groups.box.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
            data.rotationalAngle, data.delta);
          break;
        case 'Circle':
          groups.circle.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
            data.radiusA);
          break;
        case 'ClosedCone':
        // center +/- normal*height/2
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
            data.radiusA, data.radiusB, data.rotationalAngle);
          groups.circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
          groups.circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusB);
          break;
        case 'ClosedCylinder':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
            data.radiusA, data.radiusA, data.rotationalAngle);
          groups.circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
          groups.circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusA);
          break;
        case 'ClosedEccentricCone':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.eccentricCone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
            data.radiusA, data.radiusA, data.normal);
          groups.circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
          groups.circle.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal, data.radiusA);
          break;
        case 'ClosedElipsoidSegment':
          // Group.add(nodeId, treeIndex, data.color);
          break;
        case 'ClosedExtrudedRingSegment':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal,
            new THREE.Vector3(0,0,1), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
            data.rotationalAngle, data.arcAngle);
          groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal,
            new THREE.Vector3(0,0,1), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
            data.rotationalAngle, data.arcAngle);
          groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
            data.radiusA, data.rotationalAngle, data.arcAngle);
          groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusB,
            data.radiusB, data.rotationalAngle, data.arcAngle);
          // groups.quad.add
          // groups.quad.add
          break;
        case 'ClosedGeneralCylinder':
          groups.generalCylinder.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
            data.height/2, data.height/2, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB, data.rotationalAngle,
            data.arcAngle);
          // groups.generalRing.add
          // groups.generalRing.add
          break;
        case 'ClosedSphericalSegment':
          groups.circle.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA);
          groups.sphericalSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
            data.radiusA, data.height);
          break;
        case 'ClosedTorusSegment':
          // groups.circle.add
          // groups.circle.add
          groups.torusSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
            data.radiusB, data.rotationalAngle, data.arcAngle);
          break;
        case 'Ellipsoid':
          // IDK
          break;
        case 'ExtrudedRing':
        centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
        centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
        groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal,
          new THREE.Vector3(0,0,1), data.radiusA, data.radiusA, data.radiusA - data.radiusB);
        groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal,
          new THREE.Vector3(0,0,1), data.radiusA, data.radiusA, data.radiusA - data.radiusB);
        groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
          data.radiusA);
        groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
          data.radiusA);
          break;
        case 'Nut':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.nut.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
            data.radiusA, data.rotationalAngle);
          break;
        case 'OpenCone':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
          data.radiusA, data.radiusB, data.rotationalAngle);
          break;
        case 'OpenCylinder':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
          data.radiusA, data.radiusA, data.rotationalAngle);
          break;
        case 'OpenEccentricCone':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.eccentricCone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB,
            data.radiusA, data.radiusA, data.normal);
          break;
        case 'OpenEllipsoidSegment':
          // IDK
          break;
        case 'OpenExtrudedRingSegment':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal,
            new THREE.Vector3(0,0,1), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
            data.rotationalAngle, data.arcAngle);
          groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal,
            new THREE.Vector3(0,0,1), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
            data.rotationalAngle, data.arcAngle);
          groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
            data.radiusA, data.rotationalAngle, data.arcAngle);
          groups.cone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusB,
            data.radiusB, data.rotationalAngle, data.arcAngle);
          break;
        case 'OpenGeneralCylinder':
          groups.generalCylinder.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
            data.height/2, data.height/2, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB, data.rotationalAngle,
            data.arcAngle);
          break;
        case 'OpenSphericalSegment':
          groups.sphericalSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal,
            data.radiusA, data.height);
          break;
        case 'OpenTorusSegment':
          groups.torusSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
            data.radiusB, data.rotationalAngle, data.arcAngle);
          break;
        case 'Ring':
          groups.generalRing.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, new THREE.Vector3(1,0,0),
          data.radiusA, data.radiusA, data.radiusA - data.radiusB, data.rotationalAngle, data.arcAngle);
          break;
        case 'Sphere':
          groups.sphericalSegment.add(data.nodeId, data.treeIndex, data.color, data.center, new THREE.Vector3(1,0,0), data.radiusA, 2 * data.radiusA);
          break;
        case 'Torus':
          groups.torusSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA, data.radiusB,
            data.rotationalAngle, data.arcAngle);
          break;
        case 'TriangleMesh':
          // groups.triangleMesh.add(data.triangleOffset, data.triangleCount, data.nodeId, data.treeIndex, data.color);
          break;
        case 'InstancedMesh':
          // groups.instancedMesh.add(data.nodeId, data.treeIndex, data.color, data.)
          break;
        default:
          throw Error('Unrecognized geometry name ' + geometryInfo.name);
      }
    }
  }
  return groups;
}

export { generateGeometryGroups };
