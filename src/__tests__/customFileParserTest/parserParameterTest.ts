import { filePrimitives, IdToFileGeometryName, fileGeometryProperties,
  renderedPrimitives, renderedPrimitivesPerFilePrimitive, renderedPrimitiveToGroup,
  renderedPrimitiveToAddFunction,  fileMeshes} from '../../customFileParser/parserParameters';

describe('parserParameter', () => {
  test('filePrimitiveDictionaries', async() => {
    expect(Object.keys(IdToFileGeometryName).length).toBe(filePrimitives.length + fileMeshes.length);
    expect(Object.keys(renderedPrimitivesPerFilePrimitive).length).toBe(filePrimitives.length);
    const idKeys = Object.keys(IdToFileGeometryName);
    for (let i = 0; i < filePrimitives.length; i++) {
      const filePrimitive: string = filePrimitives[i];
      expect(IdToFileGeometryName[parseInt(idKeys[i], 10)]).toBe(filePrimitive);
      expect(fileGeometryProperties[filePrimitive]).toBeDefined();

      const localRenderedPrimitives = renderedPrimitivesPerFilePrimitive[filePrimitive];

      for (let j = 0; j < localRenderedPrimitives.length; j++) {
        const renderedPrimitive = localRenderedPrimitives[j];
        expect(renderedPrimitives.indexOf(renderedPrimitive)).not.toBe(-1);
      }
    }

    expect(Object.keys(renderedPrimitiveToGroup).length).toBe(renderedPrimitives.length);
    for (let i = 0; i < renderedPrimitives.length; i++) {
      expect(renderedPrimitiveToGroup[Object.keys(renderedPrimitiveToGroup)[i]]).toBeDefined();
    }
  });
});
