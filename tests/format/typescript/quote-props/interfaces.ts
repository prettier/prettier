interface I1 {
  "method"(): string;
  method2(): string;
  "method-3"(): string;
}

interface I2 {
  "property": string;
  property2: string;
  "property-3": string;
}

// `"new"` as a method must stay quoted: `new(…)` would be a construct signature.
interface INewMethod {
  "new"(id: string): number;
}

// `"new"` as a property is safe to unquote.
interface INewProperty {
  "new": number;
}
