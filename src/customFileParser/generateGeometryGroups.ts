import * as THREE from 'three';

import { SectorInformation, GeometryGroups } from './sharedFileParserTypes';

import DataLoader from './DataLoader';

export default function loadGeometryGroup(groups: GeometryGroups, segmentInformation: SectorInformation, groupName: string) {

  const data = new DataLoader(segmentInformation.propertyTrueValues);
  const centerA = new THREE.Vector3();
  const centerB = new THREE.Vector3();

    const geometryInfo = segmentInformation.geometryIndexes[groupName];

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
          groups.ellipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
            data.radiusB, data.height);
          // And something else
          break;
        case 'ClosedExtrudedRingSegment':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal,
            new THREE.Vector3(0, 0, 1), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
            data.rotationalAngle, data.arcAngle);
          groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal,
            new THREE.Vector3(0, 0, 1), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
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
            data.height / 2, data.height / 2, data.slopeA, data.slopeB, data.zAngleA, data.zAngleB,
            data.rotationalAngle, data.arcAngle);
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
          groups.ellipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
            data.radiusB, data.radiusB * 2);
          // And something else
          break;
        case 'ExtrudedRing':
        centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
        centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
        groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal,
          new THREE.Vector3(0, 0, 1), data.radiusA, data.radiusA, data.radiusA - data.radiusB);
        groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal,
          new THREE.Vector3(0, 0, 1), data.radiusA, data.radiusA, data.radiusA - data.radiusB);
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
          groups.ellipsoidSegment.add(data.nodeId, data.treeIndex, data.color, data.center, data.normal, data.radiusA,
            data.radiusB, data.radiusB * 2);
          break;
        case 'OpenExtrudedRingSegment':
          centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
          centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
          groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerA, data.normal,
            new THREE.Vector3(0, 0, 1), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
            data.rotationalAngle, data.arcAngle);
          groups.generalRing.add(data.nodeId, data.treeIndex, data.color, centerB, data.normal,
            new THREE.Vector3(0, 0, 1), data.radiusA, data.radiusA, data.radiusA - data.radiusB,
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
  return groups;
}

export { generateGeometryGroups };
