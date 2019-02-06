import { fileGeometries, IdToFileGeometryName, fileProperties, fileGeometryProperties,
  renderedGeometries, renderedGeometriesPerFileGeometry, renderedGeometryToGroup,
  renderedGeometryToAddFunction } from '../../customFileParser/parserParameters';

describe('parserParameter', () => {
  test('fileGeometryDictionaries', async() => {
    expect(Object.keys(IdToFileGeometryName).length).toBe(fileGeometries.length);
    expect(Object.keys(renderedGeometriesPerFileGeometry).length).toBe(fileGeometries.length);
    const idKeys = Object.keys(IdToFileGeometryName);
    for (let i = 0; i < fileGeometries.length; i++) {
      const fileGeometry: string = fileGeometries[i];
      expect(IdToFileGeometryName[parseInt(idKeys[i], 10)]).toBe(fileGeometry);
      expect(fileGeometryProperties[fileGeometry]).toBeDefined();

      const localRenderedGeometries = renderedGeometriesPerFileGeometry[fileGeometry];

      for (let j = 0; j < localRenderedGeometries.length; j++) {
        const renderedGeometry = localRenderedGeometries[j];
        expect(renderedGeometries.indexOf(renderedGeometry)).not.toBe(-1);
      }
    }

    expect(Object.keys(renderedGeometryToGroup).length).toBe(renderedGeometries.length);
    for (let i = 0; i < renderedGeometries.length; i++) {
      const renderedGeometry = renderedGeometries[i];
      expect(renderedGeometryToGroup[Object.keys(renderedGeometryToGroup)[i]]).toBeDefined();
    }
  });
});
