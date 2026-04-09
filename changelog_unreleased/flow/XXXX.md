#### Support `readonly` as a variance annotation (#XXXX by @marcoww6)

Flow now accepts `readonly` as a property variance annotation, equivalent to `+` (covariant/read-only).

<!-- prettier-ignore -->
```jsx
// Input
type T = {
  readonly foo: string,
};

// Prettier stable
SyntaxError

// Prettier main
type T = {
  readonly foo: string,
};
```
