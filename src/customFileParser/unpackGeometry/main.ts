import * as THREE from 'three';
import { SectorInformation, GeometryGroups } from './../sharedFileParserTypes';
import DataLoader from './../DataLoader';

import { addBox, addCircle, addNut, addRing, addSphere } from './basic';
import { addClosedCone, addClosedEccentricCone, addOpenCone, addOpenEccentricCone } from './cone';
import { addExtrudedRing, addClosedExtrudedRingSegment, addOpenExtrudedRingSegment } from './extrudedRing';
import { addClosedCylinder, addClosedGeneralCylinder, addOpenCylinder, addOpenGeneralCylinder } from './cylinder';
import { addClosedEllipsoidSegment, addOpenEllipsoidSegment, addEllipsoid } from './ellipsoid';
import { addClosedTorusSegment, addOpenTorusSegment, addTorus } from './torus';
import { addClosedSphericalSegment, addOpenSphericalSegment } from './sphericalSegment';
import { addTriangleMesh, addInstancedMesh } from './mesh';

export default function unpackGeometry(
  groups: GeometryGroups, sectorInformation: SectorInformation, trueValueArrays: any, groupName: string) {

  const data = new DataLoader(trueValueArrays);

  const geometryInfo = sectorInformation.geometryIndexes[groupName];

  const adderFunctions: {[name: string]: Function} = {
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

  for (let j = 0; j < geometryInfo.geometryCount; j++) {
    data.loadData(geometryInfo);
    // @ts-ignore
    adderFunctions[geometryInfo.name].call(this, groups, data);
  }
}
