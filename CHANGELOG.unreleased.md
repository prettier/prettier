<!--

NOTE: Don't forget to add a link to your GitHub profile and the PR in the end of the file.

Format:

### Category: Title ([#PR] by [@user])

Description

```
// Input
Code Sample

// Output (Prettier stable)
Code Sample

// Output (Prettier master)
Code Sample
```

Details:

  Description: optional if the `Title` is enough to explain everything.

Examples:

### TypeScript: Correctly handle `//` in TSX ([#5728] by [@JamesHenry])

Previously, putting `//` as a child of a JSX element in TypeScript led to an error
because it was interpreted as a comment. Prettier master fixes this issue.

<!-- prettier-ignore --\>
```js
// Input
const link = <a href="example.com">http://example.com</a>

// Output (Prettier stable)
// Error: Comment location overlaps with node location

// Output (Prettier master)
const link = <a href="example.com">http://example.com</a>;
```

-->

### JavaScript: Don't break simple template literals ([#5979] by [@jwbay])

<!-- prettier-ignore -->
```js
// Input
console.log(chalk.white(`Covered Lines below threshold: ${coverageSettings.lines}%. Actual: ${coverageSummary.total.lines.pct}%`))

// Output (Prettier stable)
console.log(
  chalk.white(
    `Covered Lines below threshold: ${coverageSettings.lines}%. Actual: ${
      coverageSummary.total.lines.pct
    }%`
  )
);

// Output (Prettier master)
console.log(
  chalk.white(
    `Covered Lines below threshold: ${coverageSettings.lines}%. Actual: ${coverageSummary.total.lines.pct}%`
  )
);
```

### TypeScript: Keep trailing comma in tsx type parameters ([#6115] by [@sosukesuzuki])

Previously, a trailing comma after single type parameter in arrow function was cleaned up. The formatted result is valid as ts, but is invalid as tsx. Prettier master fixes this issue.

<!-- prettier-ignore -->
```tsx
// Input
type G<T> = any;
const myFunc = <T,>(arg1: G<T>) => false;

// Output (Prettier stable)
type G<T> = any;
const myFunc = <T>(arg1: G<T>) => false;

// Output (prettier master)
type G<T> = any;
const myFunc = <T,>(arg1: G<T>) => false;
```

### TypeScript: Don’t breakup call expressions when the last argument is an arrow function with a simple return type ([#6106] by [@brainkim])

<!-- prettier-ignore -->
```js
Fixes [an edge-case](#6099) where we were splitting up call expressions containing arrow functions with simple return types.
app.get("/", (req, res): void => {
  res.send("Hello World!");
});

// Output (Prettier stable)
app.get(
  "/",
  (req, res): void => {
    res.send("Hello World!");
  },
);

// Output (Prettier master)
app.get("/", (req, res): void => {
  res.send("Hello World!");
});
```

### JavaScript: Fix closure typecasts without spaces ([#6116] by [@jridgewell])

Previously, a space was required between the `@type` and opening `{` of a closure typecast, or else the enclosing parenthesis would be removed. Closure itself does not require a space.

<!-- prettier-ignore -->
```tsx
// Input
const v = /** @type{string} */(value);

// Output (Prettier stable)
const v = /** @type{string} */ value;

// Output (prettier master)
const v = /** @type{string} */ (value);
```

[#5979]: https://github.com/prettier/prettier/pull/5979
[#6115]: https://github.com/prettier/prettier/pull/6115
[#6106]: https://github.com/prettier/prettier/pull/6106
[#6116]: https://github.com/prettier/prettier/pull/6116
[@jridgewell]: https://github.com/jridgewell
[@jwbay]: https://github.com/jwbay
[@brainkim]: https://github.com/brainkim
[@sosukesuzuki]: https://github.com/sosukesuzuki
