// Copyright 2019 Cognite AS
import * as THREE from 'three';
import parseBoxes from '../../parsers/protobuf/parseBoxes';
import { expectVector3Equal, expectColorEqual, expectVector3Valid, expectColorValid } from '../../TestUtils';
import BoxGroup from '../../geometry/BoxGroup';
import { PrimitiveGroupMap } from '../../geometry/PrimitiveGroup';

import * as TestScene from '../fixtures/test_scene.json';
import {MatchingGeometries,
        parsePrimitiveColor,
        parsePrimitiveNodeId,
        parsePrimitiveTreeIndex } from '../../parsers/protobuf/protobufUtils';

const color = new THREE.Color();
describe('parseBoxes', () => {
  test('parseBoxes', () => {
    // const indexPairs = [ [19, 0], [39, 1]]; // Pairs

    // const primitiveGroupMap: PrimitiveGroupMap = {};
    // // @ts-ignore
    // const didCreateNewGroup = parseBoxes(TestScene.geometries, primitiveGroupMap);
    // expect(didCreateNewGroup).toBeTruthy();
    // expect(primitiveGroupMap.Box).toBeDefined();

    // const group = primitiveGroupMap.Box;
    // expect(group.capacity).toBe(2);

    // indexPairs.forEach(indexPair => {
    //   const boxIndex = indexPair[0];
    //   const groupIndex = indexPair[1];
    //   const box = TestScene.geometries[boxIndex];

    //   // @ts-ignore
    //   const primitiveInfo = box.primitiveInfo[box.type];
    //   expect(group.getNodeId(groupIndex)).toBe(parsePrimitiveNodeId(box));
    //   expect(group.getTreeIndex(groupIndex)).toBe(parsePrimitiveTreeIndex(box));

    //   const { angle = 0.0 } = primitiveInfo;

    //   let { x = 0, y = 0, z = 0 } = primitiveInfo.center;
    //   const center = new THREE.Vector3(x, y, z);

    //   ({ x = 0, y = 0, z = 0 } = primitiveInfo.normal);
    //   const normal = new THREE.Vector3(x, y, z);

    //   ({ x = 0, y = 0, z = 0 } = primitiveInfo.delta);
    //   const delta = new THREE.Vector3(x, y, z);

    //   color.setHex(parsePrimitiveColor(box));
    //   expectColorValid(group.getColor(new THREE.Color(), groupIndex));
    //   expectVector3Valid(group.getCenter(new THREE.Vector3(), groupIndex));
    //   expectVector3Valid(group.getNormal(new THREE.Vector3(), groupIndex));
    //   expectVector3Valid(group.getDelta(new THREE.Vector3(), groupIndex));

    //   expectColorEqual(group.getColor(new THREE.Color(), groupIndex), color);
    //   expectVector3Equal(group.getCenter(new THREE.Vector3(), groupIndex), center);
    //   expectVector3Equal(group.getNormal(new THREE.Vector3(), groupIndex), normal);
    //   expectVector3Equal(group.getDelta(new THREE.Vector3(), groupIndex), delta);
    //   expect(group.getAngle(groupIndex)).toBeCloseTo(angle);
    // });
  });
});
