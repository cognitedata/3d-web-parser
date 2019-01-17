// Copyright 2019 Cognite AS

import { Root, Reader } from 'protobufjs';
import * as WebSceneProto from './proto/web_scene.json';

function makeReader(dataArray: Uint8Array) {
  return new Reader(dataArray);
}

export default class ProtobufDecoder {
  static Types = {
    WEB_SCENE: 'cognite.data.threed.web.WebScene',
    WEB_NODE: 'cognite.data.threed.web.WebNode',
  };

  private readonly root: Root;

  constructor() {
    this.root = Root.fromJSON(WebSceneProto);
  }

  async decode(type: string, dataArray: Uint8Array) {
    if (type === ProtobufDecoder.Types.WEB_SCENE) {
      return this.decodeWebScene(dataArray);
    }

    const MessageType = this.root.lookupType(type);
    return MessageType.decode(makeReader(dataArray));
  }

  *decodeWebScene(dataArray: Uint8Array): IterableIterator<any> {
    // custom implementation of decoder for WebScene (as an array of WebNodes)
    const reader = makeReader(dataArray);
    const WebNode = this.root.lookupType(ProtobufDecoder.Types.WEB_NODE);

    while (reader.pos < reader.len) {
      const t = reader.uint32();
      switch (t >>> 3) {
        case 1: {
          const node = WebNode.decode(reader, reader.uint32());
          yield node;
          break;
        }

        default:
          reader.skipType(t & 7);
      }
    }
  }
}
