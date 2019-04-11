// Copyright 2019 Cognite AS

import { ParseData } from '../parseUtils';

import parseBoxes from './parseBoxes';
import parseCircles from './parseCircles';
import parseCones from './parseCones';
import parseEccentricCones from './parseEccentricCones';
import parseEllipsoidSegments from './parseEllipsoidSegments';
import parseGeneralCylinders from './parseGeneralCylinders';
import parseGeneralRings from './parseGeneralRings';
import parseNuts from './parseNuts';
import parseQuads from './parseQuads';
import parseSphericalSegments from './parseSphericalSegments';
import parseTorusSegments from './parseTorusSegments';
import parseTrapeziums from './parseTrapeziums';
import parseMergedMeshes from './parseMergedMeshes';
import parseInstancedMeshes from './parseInstancedMeshes';
type ProtobufParser = (args: ParseData) => boolean;

export {
  parseBoxes,
  parseCircles,
  parseCones,
  parseEccentricCones,
  parseEllipsoidSegments,
  parseGeneralCylinders,
  parseGeneralRings,
  parseNuts,
  parseQuads,
  parseSphericalSegments,
  parseTorusSegments,
  parseTrapeziums,
  parseMergedMeshes,
  parseInstancedMeshes,
  ProtobufParser,
};
