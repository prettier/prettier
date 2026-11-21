#### Preserve parentheses around mapped type `keyof` constraints (#XXXX by @RealThanhNguyxn)

Parentheses around a mapped type's `keyof` constraint affect whether TypeScript preserves optional and readonly property modifiers. Prettier now preserves these parentheses to avoid changing the resulting type.

<!-- prettier-ignore -->
```ts
// Input
type BooleanValues = {
  [key in (keyof MyObject)]: boolean;
};

// Prettier stable
type BooleanValues = {
  [key in keyof MyObject]: boolean;
};

// Prettier main
type BooleanValues = {
  [key in (keyof MyObject)]: boolean;
};
```
