export default class Sector {
  public parent: undefined | Sector;
  constructor() {
  }
  addParent(parent: Sector) {
    this.parent = parent;
  }
}
