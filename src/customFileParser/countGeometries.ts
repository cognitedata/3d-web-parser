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
        counts.circle += geometryInfo.geometryCount;
        break;
      case 'ClosedExtrudedRingSegment':
        counts.generalRing += geometryInfo.geometryCount;
        break;
      case 'ClosedGeneralCylinder':
        counts.cone += geometryInfo.geometryCount; // overestimate
        counts.generalCylinder += geometryInfo.geometryCount; // overestimate
        break;
      case 'ClosedSphericalSegment':
        counts.circle += geometryInfo.geometryCount;
        counts.generalCylinder += geometryInfo.geometryCount;
        break;
      case 'ClosedTorusSegment':
        counts.torusSegment += geometryInfo.geometryCount;
        break;
      case 'Ellipsoid':
        counts.generalRing += geometryInfo.geometryCount;
        break;
      case 'ExtrudedRing':
        counts.generalRing += geometryInfo.geometryCount;
        break;
      case 'Nut':
        counts.nut += geometryInfo.geometryCount;
        break;
      case 'OpenCone':
        counts.cone += geometryInfo.geometryCount;
        break;
      case 'OpenCylinder':
        counts.generalCylinder += geometryInfo.geometryCount;
        break;
      case 'OpenEccentricCone':
        counts.eccentricCone += geometryInfo.geometryCount;
        break;
      case 'OpenEllipsoidSegment':
        counts.generalRing += geometryInfo.geometryCount;
        break;
      case 'OpenExtrudedRingSegment':
        counts.generalRing += geometryInfo.geometryCount;
        break;
      case 'OpenGeneralCylinder':
        counts.generalCylinder += geometryInfo.geometryCount;
        break;
      case 'OpenSphericalSegment':
        counts.generalCylinder += geometryInfo.geometryCount;
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
