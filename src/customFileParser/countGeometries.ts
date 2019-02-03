import { Counts } from './sharedFileParserTypes';

export default function countGeometries(segmentInformation: any) {
  const counts: Counts = {
    box: 0,
    circle: 0,
    cone: 0,
    eccentricCone: 0,
    generalCylinder: 0,
    generalRing: 0,
    nut: 0,
    quad: 0,
    sphericalSegment: 0,
    torusSegment: 0,
    trapezium: 0,
    triangleMesh: 0,
    instancedMesh: 0,
  };

  for (let i = 0; i < segmentInformation.geometryIndexes.length; i++) {
    const geometryInfo = segmentInformation.geometryIndexes[i];
    switch (segmentInformation.geometryIndexes[i].name) {
      case 'Box':
        counts.box += geometryInfo.geometryCount;
        break;
      case 'Circle':
        counts.circle += geometryInfo.geometryCount;
        break;
      case 'ClosedCone':
        counts.circle += 2 * geometryInfo.geometryCount;
        counts.cone += geometryInfo.geometryCount;
        break;
      case 'ClosedCylinder':
        counts.circle += 2 * geometryInfo.geometryCount;
        counts.cone += geometryInfo.geometryCount;
        break;
      case 'ClosedEccentricCone':
        counts.circle += 2 * geometryInfo.geometryCount;
        counts.eccentricCone += geometryInfo.geometryCount;
      case 'ClosedElipsoidSegment':
        // IDK
        break;
      case 'ClosedExtrudedRingSegment':
        counts.cone += 2 * geometryInfo.geometryCount;
        counts.generalRing += 2 * geometryInfo.geometryCount;
        // counts.quad += 2
        break;
      case 'ClosedGeneralCylinder':
        counts.generalCylinder += geometryInfo.geometryCount;
        // counts.generalRing += 2 * geometryInfo.geometryCount;
        break;
      case 'ClosedSphericalSegment':
        counts.circle += geometryInfo.geometryCount;
        counts.sphericalSegment += geometryInfo.geometryCount;
        break;
      case 'ClosedTorusSegment':
        counts.torusSegment += geometryInfo.geometryCount;
        // counts.circle += 2 * geometryInfo.geometryCount;
        break;
      case 'Ellipsoid':
        // IDK
        break;
      case 'ExtrudedRing':
        counts.generalCylinder += 2 * geometryInfo.geometryCount;
        counts.cone += 2 * geometryInfo.geometryCount;
        break;
      case 'Nut':
        counts.nut += geometryInfo.geometryCount;
        break;
      case 'OpenCone':
        counts.cone += geometryInfo.geometryCount;
        break;
      case 'OpenCylinder':
        counts.cone += geometryInfo.geometryCount;
        break;
      case 'OpenEccentricCone':
        counts.eccentricCone += geometryInfo.geometryCount;
        break;
      case 'OpenEllipsoidSegment':
        counts.generalRing += geometryInfo.geometryCount;
        break;
      case 'OpenExtrudedRingSegment':
        counts.cone += 2 * geometryInfo.geometryCount;
        counts.generalRing += 2 * geometryInfo.geometryCount;
        break;
      case 'OpenGeneralCylinder':
        counts.generalCylinder += geometryInfo.geometryCount;
        break;
      case 'OpenSphericalSegment':
        counts.sphericalSegment += geometryInfo.geometryCount;
        break;
      case 'OpenTorusSegment':
        counts.torusSegment += geometryInfo.geometryCount;
        break;
      case 'Ring':
        counts.generalRing += geometryInfo.geometryCount;
        break;
      case 'Sphere':
        counts.generalCylinder += geometryInfo.geometryCount;
        break;
      case 'Torus':
        counts.torusSegment += geometryInfo.geometryCount;
        break;
      case 'TriangleMesh':
        // 
        break;
      case 'InstancedMesh':
        //
        break;
      default:
        throw Error('Unknown geometry type ' +
        segmentInformation.geometryIndexes[i].name);
    }
  }

  return counts;
}
