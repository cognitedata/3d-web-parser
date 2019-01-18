function parseValue(value: any): any {
  switch (value.kind) {
    case 'nullValue':
      return null;

    case 'numberValue':
    case 'stringValue':
    case 'boolValue':
      return value[value.kind];

    case 'structValue': {
      const result = {};

      Object.keys(value.structValue.fields).forEach(key => {
        // @ts-ignore
        result[key] = parseValue(value.structValue.fields[key]);
      });

      return result;
    }

    case 'listValue':
    // @ts-ignore
      return value.listValue.values.map(v => parseValue(v));

    default:
      return undefined;
  }
}

/**
 * Convert from a Protobuf Struct representation to pure JavaScript object representation
 */
function parseStruct(object: any): any {
  return parseValue({ kind: 'structValue', structValue: object });
}

export function parsePrimitiveInfo(primitiveInfo: any): any {
  if (primitiveInfo == null) { return null; }
  if (primitiveInfo.jsonPrimitiveInfo != null) {
    return parseStruct(primitiveInfo.jsonPrimitiveInfo);
  }
  return primitiveInfo[primitiveInfo.kind];
}

export function parsePrimitiveNodeId(data: any): number {
  return Number(data.nodes[0].properties[0].nodeId);
}

export function parsePrimitiveTreeIndex(data: any): number {
  return Number(data.nodes[0].properties[0].treeIndex);
}

export function parsePrimitiveColor(data: any): any {
  if (data.properties) {
    return data.properties.color.rgb;
  }
  return data.nodes[0].properties[0].color.rgb;
}
