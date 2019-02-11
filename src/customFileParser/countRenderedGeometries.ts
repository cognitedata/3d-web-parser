import { GeometryIndexHandler } from './sharedFileParserTypes';
import { fileGeometries, renderedGeometries, renderedGeometriesPerFileGeometry } from './parserParameters';

export default function countRenderedGeometries(geometryIndexHandlers: GeometryIndexHandler[]) {
  const counts: {[name: string]: number} = {};
  renderedGeometries.forEach(renderedGeometry => {
    counts[renderedGeometry] = 0;
  });

  geometryIndexHandlers.forEach(geometryIndexHandler => {
    const geometryCount = geometryIndexHandler.geometryCount;
    renderedGeometriesPerFileGeometry[geometryIndexHandler.name].forEach(renderedGeometry => {
      counts[renderedGeometry] += geometryCount;
    });
  });

  return counts;
}
