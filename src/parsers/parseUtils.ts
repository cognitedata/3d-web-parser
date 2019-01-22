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

export interface MatchingGeometries {
  count: number;
  geometries: any[];
}
