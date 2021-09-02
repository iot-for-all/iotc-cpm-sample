export class ManufacturerMap {
  static mMap: {
    [ManufacturerId: string]: {
      ids: string[];
      deviceCtr: any;
    };
  } = {};

  static addManufacturer(name: string, ids: string[], deviceCtr: any): void {
    if (!this.mMap[name]) {
      this.mMap[name] = {
        ids,
        deviceCtr,
      };
    }
  }

  static getManufacturerConstructor(name: string) {
    if (!this.mMap[name]) {
      return null;
    }
    return this.mMap[name].deviceCtr;
  }

  static getManufacturers() {
    return Object.keys(this.mMap);
  }

  static getManufacturerIds(name: string): string[] | null {
    if (this.mMap[name]) {
      return this.mMap[name].ids;
    }
    return null;
  }

  static removeManufacturer(name: string) {
    if (this.mMap[name]) {
      delete this.mMap[name];
    }
  }
}
