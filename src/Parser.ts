// Copyright 2019 Cognite AS

import ProtobufDecoder from './ProtobufDecoder';
import * as WebSceneProto from './proto/web_scene.json';
import * as THREE from 'three';
import Sector from './Sector';
import { Vector3 } from 'three';
import { getParentPath } from './PathExtractor';
import CircleGroup from './geometry/CircleGroup';
import GeometryGroup from './geometry/GeometryGroup';
import parseCircles from './parsers/parseCircles';

function parseGeometries(geometries: any[]) {
  const geometryGroups = [];
  geometryGroups.push(parseCircles(geometries));
  geometryGroups.push(null);
  return geometryGroups.filter(Boolean);
}

export default async function(protobufData: Uint8Array) {
  const protobufDecoder = new ProtobufDecoder();

  const nodes: { [path: string]: Sector } = { };
  for (const webNode of protobufDecoder.decodeWebScene(protobufData)) {
    const { boundingBox, path } = webNode;
    const boundingBoxMin = new Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);
    const boundingBoxMax = new Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z);
    const sector = new Sector(boundingBoxMin, boundingBoxMax);
    nodes[path] = sector;
    const geometries = parseGeometries(webNode.geometries);
    // console.log('Geometries: ', webNode.geometries);

    // attach to parent
    const parentPath = getParentPath(path);
    if (parentPath !== undefined) {
      nodes[parentPath].addChild(sector);
    }
  }

  // return root node
  return nodes['0/'];
}
