type T1 = {
  "method"(): string;
  method2(): string;
  "method-3"(): string;
}

type T2 = {
  "property": string;
  property2: string;
  "property-3": string;
}

// `"new"` as a method must stay quoted: `new(…)` would be a construct signature.
type TNewMethod = {
  "new"(id: string): number;
};

// `"new"` as a property is safe to unquote.
type TNewProperty = {
  "new": number;
};
