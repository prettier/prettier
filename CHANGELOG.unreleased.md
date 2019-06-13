<!--

NOTE: Don't forget to add a link to your GitHub profile and the PR in the end of the file.

Format:

#### Category: Title ([#PR] by [@user])

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

#### TypeScript: Correctly handle `//` in TSX ([#5728] by [@JamesHenry])

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

#### TypeScript: Print comment following a JSX element with generic ([#6209] by [@duailibe])

Previous versions would not print this comment, this has been fixed in this version.

<!-- prettier-ignore -->
```ts
// Input
const comp = (
  <Foo<number>
    // This comment goes missing
    value={4}
  >
    Test
  </Foo>
);

// Output (Prettier stable)
const comp = <Foo<number> value={4}>Test</Foo>;

// Output (Prettier master)
const comp = (
  <Foo<number>
    // This comment goes missing
    value={4}
  >
    Test
  </Foo>
);
```

### Handlebars: Avoid adding unwanted line breaks between text and mustaches ([#6186] by [@gavinjoyce])

Previously, Prettier added line breaks between text and mustaches which resulted in unwanted whitespace in rendered output.

<!-- prettier-ignore -->
```hbs
// Input
<p>Your username is @{{name}}</p>
<p>Hi {{firstName}} {{lastName}}</p>

// Output (Prettier stable)
<p>
  Your username is @
  {{name}}
</p>
<p>
  Hi
  {{firstName}}
  {{lastName}}
</p>

// Output (Prettier master)
<p>
  Your username is @{{name}}
</p>
<p>
  Hi {{firstName}} {{lastName}}
</p>
```

#### JavaScript: Keep unary expressions parentheses with comments ([#6217] by [@sosukesuzuki])

Previously, Prettier removes parentheses enclose unary expressions. This change modify to keep it when the expression has comments.

<!-- prettier-ignore -->
```ts
// Input
!(
  /* foo */
  foo
);

// Output (Prettier stable)
!/* foo */
foo;

// Output (Prettier master)
!(
  /* foo */
  foo
);
```

[#6209]: https://github.com/prettier/prettier/pull/6209
[#6186]: https://github.com/prettier/prettier/pull/6186
[#6217]: https://github.com/prettier/prettier/pull/6217
[@duailibe]: https://github.com/duailibe
[@gavinjoyce]: https://github.com/gavinjoyce
[@sosukesuzuki]: https://github.com/sosukesuzuki
