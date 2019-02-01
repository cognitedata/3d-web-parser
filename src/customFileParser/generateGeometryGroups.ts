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
  };

  const data = new DataLoader(segmentInformation.propertyTrueValues);
  const centerA = new THREE.Vector3();
  const centerB = new THREE.Vector3();

  console.log("Starting to generate geometries");
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
          groups.eccentricCone.add(data.nodeId, data.treeIndex, data.color, centerA, centerB, data.radiusA,
            data.radiusB, data.normal);
          groups.circle.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal, data.radiusA);
          break;
        case 'ClosedElipsoidSegment':
          // Group.add(nodeId, treeIndex, data.color);
          break;
        case 'ClosedExtrudedRingSegment':
          // groups.generalRing.add(nodeId, treeIndex, data.color, center, data.normal,
          // localXAxis, xRadius, yRadius, thickness, angle? arcAngle?);
          break;
        case 'ClosedGeneralCylinder':
          // groups.generalCylinder.add(nodeId, treeIndex, data.color);
          break;
        case 'ClosedSphericalSegment':
          // groups.sphericalSegment.add(nodeId, treeIndex, data.color);
          break;
        case 'ClosedTorusSegment':
          // groups.torusSegment.add(nodeId, treeIndex, data.color);
          break;
        case 'Ellipsoid':
          // Group.add(nodeId, treeIndex, data.color);
          break;
        case 'ExtrudedRing':
          // groups.generalRing.add(nodeId, treeIndex, data.color);
          break;
        case 'Nut':
          // groups.nut.add(nodeId, treeIndex, data.color);
          break;
        case 'OpenCone':
          // groups.cone.add(nodeId, treeIndex, data.color);
          break;
        case 'OpenCylinder':
          // groups.generalCylinder.add(nodeId, treeIndex, data.color);
          break;
        case 'OpenEccentricCone':
          // groups.cone.add(nodeId, treeIndex, data.color);
          break;
        case 'OpenEllipsoidSegment':
          // Group.add(nodeId, treeIndex, data.color);
          break;
        case 'OpenExtrudedRingSegment':
          // groups.generalRing.add(nodeId, treeIndex, color);
          break;
        case 'OpenGeneralCylinder':
          // groups.generalCylinder.add(nodeId, treeIndex, color);
          break;
        case 'OpenSphericalSegment':
          // groups.sphericalSegment.add(nodeId, treeIndex, color);
          break;
        case 'OpenTorusSegment':
          // blah
          break;
        case 'Ring':
          // groups.generalRing.add(nodeId, treeIndex, color);
          break;
        case 'Sphere':
          // groups.sphericalSegment.add(nodeId, treeIndex, color);
          break;
        case 'Torus':
          // groups.torusSegment.add(nodeId, treeIndex, color);
          break;
        case 'TriangleMesh':
          // asdf
          break;
        case 'InstancedMesh':
          //
          break;
        default:
          throw Error('Unrecognized geometry name ' + geometryInfo.name);
      }
    }
  }
  return groups;
}

export { generateGeometryGroups };
