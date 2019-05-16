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

### JavaScript: Do not hug sequence expression in object properties ([#6088] by [@evilebottnawi])

<!-- prettier-ignore -->
```js
// Input
const a = {
  someKey:
    (longLongLongLongLongLongLongLongLongLongLongLongLongLongName, shortName)
};

// Output (Prettier stable)
const a = {
  someKey: (longLongLongLongLongLongLongLongLongLongLongLongLongLongName,
  shortName)
};

// Output (Prettier master)
const a = {
  someKey:
    (longLongLongLongLongLongLongLongLongLongLongLongLongLongName, shortName)
};
```

- JavaScript: Fix closure compiler typecasts ([#5947] by [@jridgewell])

  If a closing parenthesis follows after a typecast in an inner expression, the typecast would wrap everything to the that following parenthesis.

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

### JavaScript: Correctly handle comments in empty arrow function expressions ([#6086] by [@evilebottnawi])

<!-- prettier-ignore -->
```js
// Input
const fn = (/*event, data*/) => doSomething(anything);

// Output (Prettier stable)
const fn = () => /*event, data*/ doSomething(anything);

// Output (Prettier master)
const fn = (/*event, data*/) => doSomething(anything);
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

### JavaScript: Prevent adding quotes when using `--quote-props=consistent` and one of the keys were a computed "complex" expression ([#6119] by [@duailibe])

Previously, Prettier added unnecessary quotes to keys of an object, or properties and methods of classes, if there was at least one computed key with a "complex" expression (e.g. a member expression).

<!-- prettier-ignore -->
```js
// Input
const obj = {
  foo: "",
  [foo.bar]: "",
}

// Output (Prettier stable)
const obj = {
  "foo": "",
  [foo.bar]: "",
}

// Output (Prettier master)
const obj = {
  foo: "",
  [foo.bar]: "",
}
```

### JavaScript: Add parenthesis in JSX spread element with logical expressions ([#6130] by [@duailibe])

Previously, Prettier didn't add parenthesis in JSX spread elements because they aren't necessary, but for the sake of consistency with spread operator in objects and arrays, we'll add to JSX as well.

<!-- prettier-ignore -->
```js
// Input
<Component {...(props || {})} />;

// Output (Prettier stable)
<Component {...props || {}} />;

// Output (Prettier master)
<Component {...(props || {})} />;
```

### Markdown: correctly determine count of backticks in inline code ([#6110] by [@belochub])

By the CommonMark spec, it is required to 'choose a string of `n` backtick characters as delimiters, where the code does not contain any strings of exactly `n` backtick characters.'

This changes the method of finding the required count of backticks from using 2 backticks, when there is a backtick string of length 1 inside the inline code block, and using 1 backtick in all other cases, to finding a minimum length backtick string that can correctly be used as a delimiter.

<!-- prettier-ignore -->
````md
<!-- Input -->
``` 3 ``22`` `1` ```

`` 2 ```123``` `1` ``

<!-- Output (Prettier stable) -->
` 3 ``22`` `1` `

` 2 ```123``` `1` `

<!-- Output (Prettier master) -->
``` 3 ``22`` `1` ```

`` 2 ```123``` `1` ``
````

[#5979]: https://github.com/prettier/prettier/pull/5979
[#6086]: https://github.com/prettier/prettier/pull/6086
[#6088]: https://github.com/prettier/prettier/pull/6088
[#6106]: https://github.com/prettier/prettier/pull/6106
[#6110]: https://github.com/prettier/prettier/pull/6110
[#6115]: https://github.com/prettier/prettier/pull/6115
[#6116]: https://github.com/prettier/prettier/pull/6116
[#6119]: https://github.com/prettier/prettier/pull/6119
[#6130]: https://github.com/prettier/prettier/pull/6130
[@belochub]: https://github.com/belochub
[@brainkim]: https://github.com/brainkim
[@duailibe]: https://github.com/duailibe
[@evilebottnawi]: https://github.com/evilebottnawi
[@jridgewell]: https://github.com/jridgewell
[@jwbay]: https://github.com/jwbay
[@sosukesuzuki]: https://github.com/sosukesuzuki
