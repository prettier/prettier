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

[#5979]: https://github.com/prettier/prettier/pull/5979
[#6115]: https://github.com/prettier/prettier/pull/5979
[@jwbay]: https://github.com/jwbay
[@sosukesuzuki]: https://github.com/sosukesuzuki
