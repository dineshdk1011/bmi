
export interface IfcComponent {
  expressID: number;
  Name: string;
  ObjectType: string;
}

export interface IfcProperty {
    name: string;
    value: string | number | boolean | null;
}
