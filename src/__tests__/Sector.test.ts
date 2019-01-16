import Sector from '../Sector';

describe('Sectors', () => {
  test('add parent', () => {
    const parent = new Sector();
    const child = new Sector();
    expect(child.parent).toBe(undefined);

    child.addParent(parent);
    expect(child.parent).toBe(parent);
  });
});
