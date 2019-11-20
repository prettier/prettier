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

#### TypeScript: Support for TypeScript 3.7 ([#6657] by [@cryrivers])

Prettier 1.19 adds support for the features of the upcoming TypeScript 3.7 that introduce new syntax:

- [Optional chaining](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7-rc/#optional-chaining)
- [Nullish coalescing](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7-rc/#nullish-coalescing)
- [Assertion functions](https://devblogs.microsoft.com/typescript/announcing-typescript-3-7-rc/#assertion-functions)
- [`declare` modifier on class fields](https://github.com/microsoft/TypeScript/pull/33509)

**NOTE:** A dependency upgrade for TypeScript 3.7 led to dropping Node 6 support for direct installation from GitHub. Prettier installed from NPM stays compatible with Node 4.

##### Optional Chaining

<!-- prettier-ignore -->
```ts
// Input
const longChain = obj?.a?.b?.c?.d?.e?.f?.g;
const longChainCallExpression = obj.a?.(a,b,c).b?.(a,b,c).c?.(a,b,c).d?.(a,b,c).e?.(a,b,c).f?.(a,b,c)

// Output (Prettier master)
const longChain = obj?.a?.b?.c?.d?.e?.f?.g;
const longChainCallExpression = obj
  .a?.(a, b, c)
  .b?.(a, b, c)
  .c?.(a, b, c)
  .d?.(a, b, c)
  .e?.(a, b, c)
  .f?.(a, b, c);
```

##### Nullish Coalescing

<!-- prettier-ignore -->
```ts
// Input
const cond = null;
const result = cond??'a';
const longChain = cond??cond??cond??'b';

// Output (Prettier master)
const cond = null;
const result = cond ?? "a";
const longChain = cond ?? cond ?? cond ?? "b";
```

##### Assertion Functions

<!-- prettier-ignore -->
```ts
// Input
function assertsString(x: any): asserts x {console.assert(typeof x === 'string');}
function assertsStringWithGuard(x: any): asserts x is string {console.assert(typeof x === 'string');}

// Output (Prettier master)
function assertsString(x: any): asserts x {
  console.assert(typeof x === "string");
}
function assertsStringWithGuard(x: any): asserts x is string {
  console.assert(typeof x === "string");
}
```

##### `declare` Modifier on Class Fields

<!-- prettier-ignore -->
```ts
// Input
class B {p: number;}
class C extends B {declare p: 256 | 1000;}

// Output (Prettier master)
class B {
  p: number;
}
class C extends B {
  declare p: 256 | 1000;
}
```

#### TypeScript: Fix optional computed class fields and methods ([#6657] by [@cryrivers], [#6673] by [@thorn0])

Still broken if the key is a complex expression, but has been fixed in these cases:

<!-- prettier-ignore -->
```ts
// Input
class Foo {
  [bar]?: number;
  protected [s]?() {}
}

// Output (Prettier stable)
class Foo {
  [bar]: number;
  protected [s?]() {};
}

// Output (Prettier master)
class Foo {
  [bar]?: number;
  protected [s]?() {}
}
```

#### API: Add `resolveConfig` option to `getFileInfo()` ([#6666] by [@kaicataldo])

Add a `resolveConfig: boolean` option to `prettier.getFileInfo()` that, when set to `true`, will resolve the configuration for the given file path. This allows consumers to take any overridden parsers into account.

#### JavaScript: Add support for [partial application syntax](https://github.com/tc39/proposal-partial-application) ([#6397] by [@JounQin])

<!-- prettier-ignore -->
```js
// Input
const addOne = add(1, ?); // apply from the left
addOne(2); // 3

const addTen = add(?, 10); // apply from the right
addTen(2); // 12

// with pipeline
let newScore = player.score
  |> add(7, ?)
  |> clamp(0, 100, ?); // shallow stack, the pipe to `clamp` is the same frame as the pipe to `add`.

// Output (Prettier stable)
SyntaxError: Unexpected token (1:23)
> 1 | const addOne = add(1, ?); // apply from the left
    |                       ^
  2 | addOne(2); // 3
  3 |
  4 | const addTen = add(?, 10); // apply from the right

// Output (Prettier master)
const addOne = add(1, ?); // apply from the left
addOne(2); // 3

const addTen = add(?, 10); // apply from the right
addTen(2); // 12

// with pipeline
let newScore = player.score |> add(7, ?) |> clamp(0, 100, ?); // shallow stack, the pipe to \`clamp\` is the same frame as the pipe to \`add\`.
```

#### JavaScript: More readable parentheses for `new` call ([#6412] by [@bakkot])

<!-- prettier-ignore -->
```js
// Input
var a = new (x().y)();
var a = new (x().y.z)();
var a = new (x().y().z)();

// Output (Prettier stable)
var a = new (x()).y();
var a = new (x()).y.z();
var a = new (x().y()).z();

// Output (Prettier master)
var a = new (x().y)();
var a = new (x().y.z)();
var a = new (x().y().z)();
```

#### MDX: Text following JSX was trimmed incorrectly ([#6340] by [@JounQin])

<!-- prettier-ignore -->
```md
<!-- Input -->
# Heading
<Hello>
    test   <World />   test
</Hello>       123

<!-- Output (Prettier stable) -->
<Hello>
  test <World /> test
</Hello>123

<!-- Output (Prettier master) -->
<Hello>
  test <World /> test
</Hello> 123
```

#### TypeScript/Flow: Fix indentation for union types inside tuples ([#6381] by [@squidfunk], [#6605] by [@thorn0])

<!-- prettier-ignore -->
```ts
// Input
type A = [
  | AAAAAAAAAAAAAAAAAAAAAA
  | BBBBBBBBBBBBBBBBBBBBBB
  | CCCCCCCCCCCCCCCCCCCCCC
  | DDDDDDDDDDDDDDDDDDDDDD
]

type B = [
  | AAAAAAAAAAAAAAAAAAAAAA
  | BBBBBBBBBBBBBBBBBBBBBB
  | CCCCCCCCCCCCCCCCCCCCCC
  | DDDDDDDDDDDDDDDDDDDDDD,
  | AAAAAAAAAAAAAAAAAAAAAA
  | BBBBBBBBBBBBBBBBBBBBBB
  | CCCCCCCCCCCCCCCCCCCCCC
  | DDDDDDDDDDDDDDDDDDDDDD
]

type C = [
  | [AAAAAAAAAAAAAAAAAAAAAA | BBBBBBBBBBBBBBBBBBBBBB | CCCCCCCCCCCCCCCCCCCCCC | DDDDDDDDDDDDDDDDDDDDDD]
  | [AAAAAAAAAAAAAAAAAAAAAA | BBBBBBBBBBBBBBBBBBBBBB | CCCCCCCCCCCCCCCCCCCCCC | DDDDDDDDDDDDDDDDDDDDDD]
]

// Output (Prettier stable)
type A = [

    | AAAAAAAAAAAAAAAAAAAAAA
    | BBBBBBBBBBBBBBBBBBBBBB
    | CCCCCCCCCCCCCCCCCCCCCC
    | DDDDDDDDDDDDDDDDDDDDDD
];

type B = [

    | AAAAAAAAAAAAAAAAAAAAAA
    | BBBBBBBBBBBBBBBBBBBBBB
    | CCCCCCCCCCCCCCCCCCCCCC
    | DDDDDDDDDDDDDDDDDDDDDD,

    | AAAAAAAAAAAAAAAAAAAAAA
    | BBBBBBBBBBBBBBBBBBBBBB
    | CCCCCCCCCCCCCCCCCCCCCC
    | DDDDDDDDDDDDDDDDDDDDDD
];

type C = [

    | [

          | AAAAAAAAAAAAAAAAAAAAAA
          | BBBBBBBBBBBBBBBBBBBBBB
          | CCCCCCCCCCCCCCCCCCCCCC
          | DDDDDDDDDDDDDDDDDDDDDD
      ]
    | [

          | AAAAAAAAAAAAAAAAAAAAAA
          | BBBBBBBBBBBBBBBBBBBBBB
          | CCCCCCCCCCCCCCCCCCCCCC
          | DDDDDDDDDDDDDDDDDDDDDD
      ]
];

// Output (Prettier master)
type A = [
  | AAAAAAAAAAAAAAAAAAAAAA
  | BBBBBBBBBBBBBBBBBBBBBB
  | CCCCCCCCCCCCCCCCCCCCCC
  | DDDDDDDDDDDDDDDDDDDDDD
];

type B = [
  (
    | AAAAAAAAAAAAAAAAAAAAAA
    | BBBBBBBBBBBBBBBBBBBBBB
    | CCCCCCCCCCCCCCCCCCCCCC
    | DDDDDDDDDDDDDDDDDDDDDD
  ),
  (
    | AAAAAAAAAAAAAAAAAAAAAA
    | BBBBBBBBBBBBBBBBBBBBBB
    | CCCCCCCCCCCCCCCCCCCCCC
    | DDDDDDDDDDDDDDDDDDDDDD
  )
];

type C = [
  | [
      | AAAAAAAAAAAAAAAAAAAAAA
      | BBBBBBBBBBBBBBBBBBBBBB
      | CCCCCCCCCCCCCCCCCCCCCC
      | DDDDDDDDDDDDDDDDDDDDDD
    ]
  | [
      | AAAAAAAAAAAAAAAAAAAAAA
      | BBBBBBBBBBBBBBBBBBBBBB
      | CCCCCCCCCCCCCCCCCCCCCC
      | DDDDDDDDDDDDDDDDDDDDDD
    ]
];
```

#### MDX: Adjacent JSX elements should be allowed ([#6332] by [@JounQin])

<!-- prettier-ignore -->
```jsx
// Input
<Hello>
    test   <World />   test
</Hello>123

// Output (Prettier stable)
SyntaxError: Unexpected token (3:9)
  1 | <Hello>
  2 |     test   <World />   test
> 3 | </Hello>123
    |         ^

// Output (Prettier master)
<Hello>
  test <World /> test
</Hello>123


// Input
<Hello>
    test   <World />   test
</Hello>
<Hello>
    test   <World />   test
</Hello>123

// Output (Prettier stable)
SyntaxError: Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>? (4:1)
  2 |     test   <World />   test
  3 | </Hello>
> 4 | <Hello>
    | ^
  5 |     test   <World />   test
  6 | </Hello>123

// Output (Prettier master)
<Hello>
  test <World /> test
</Hello>
<Hello>
  test <World /> test
</Hello>123
```

#### TypeScript: Comments after JSX element names with type arguments were lost ([#6209] by [@duailibe])

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

#### Handlebars: Avoid adding unwanted line breaks between text and mustaches ([#6186] by [@gavinjoyce])

Previously, Prettier added line breaks between text and mustaches which resulted in unwanted whitespace in rendered output.

<!-- prettier-ignore -->
```hbs
<!-- Input -->
<p>Your username is @{{name}}</p>
<p>Hi {{firstName}} {{lastName}}</p>

<!-- Output (Prettier stable) -->
<p>
  Your username is @
  {{name}}
</p>
<p>
  Hi
  {{firstName}}
  {{lastName}}
</p>

<!-- Output (Prettier master) -->
<p>
  Your username is @{{name}}
</p>
<p>
  Hi {{firstName}} {{lastName}}
</p>
```

#### Handlebars: Improve comment formatting ([#6206] by [@gavinjoyce])

Previously, Prettier would sometimes ignore whitespace when formatting comments.

<!-- prettier-ignore -->
```hbs
<!-- Input -->
<div>
  {{! Foo }}
  {{#if @foo}}
    Foo
  {{/if}}

  {{! Bar }}
  {{#if @bar}}
    Bar
  {{/if}}
</div>

<!-- Output (Prettier stable) -->
<div>
  {{! Foo }}
  {{#if @foo}}
    Foo
  {{/if}}{{! Bar }}{{#if @bar}}
    Bar
  {{/if}}
</div>

<!-- Output (Prettier master) -->
<div>
  {{! Foo }}
  {{#if @foo}}
    Foo
  {{/if}}
  {{! Bar }}
  {{#if @bar}}
    Bar
  {{/if}}
</div>
```

#### JavaScript: Update `??` precedence to match stage 3 proposal ([#6404] by [@vjeux], [#6863] by [@jridgewell])

We've updated Prettier's support for the nullish coalescing operator to match a spec update that no longer allows it to immediately contain, or be contained within, an `&&` or `||` operation.

<!-- prettier-ignore -->
```js
// Input
(foo ?? bar) || baz;
(foo || bar) ?? baz;

// Output (Prettier stable)
foo ?? bar || baz;
foo || bar ?? baz;

// Output (Prettier master)
(foo ?? bar) || baz;
(foo || bar) ?? baz;
```

Please note, as we update our parsers with versions that support this spec update, code without the parenthesis will throw a parse error.

#### JavaScript: Keep parentheses with comments in unary expressions ([#6217] by [@sosukesuzuki])

<!-- prettier-ignore -->
```ts
// Input
!(
  /* foo */
  foo
);
!(
  foo // foo
);

// Output (Prettier stable)
!/* foo */
foo;
!foo; // foo

// Output (Prettier master)
!(/* foo */ foo);
!(
  foo // foo
);
```

#### Javascript: Use function literals in arguments to detect function composition ([#6033] by [@brainkim])

Previously, we used a set of hard-coded names related to functional programming
(`compose`, `flow`, `pipe`, etc.) to detect function composition and chaining
patterns in code. This was done so that Prettier would not put code like the
following call to `pipe` on the same line even if it fit within the allotted
column budget:

<!-- prettier-ignore -->
```js
source$
  .pipe(
    filter(x => x % 2 === 0),
    map(x => x + x),
    scan((acc, x) => acc + x, 0),
  )
  .subscribe(x => console.log(x));
```

However, this heuristic caused people to complain because of false positives
where calls to functions or methods matching the hard-coded names would always
be split on multiple lines, even if the calls did not contain function
arguments ([#5769](https://github.com/prettier/prettier/issues/5769), [#5969](https://github.com/prettier/prettier/issues/5969)). For many, this blanket
decision to split functions based on name was both surprising and sub-optimal.

We now use a refined heuristic which uses the presence of function literals to
detect function composition. This heuristic preserves the line-splitting
behavior above and eliminates many if not all of the false positives caused by
the older heuristic.

We encourage prettier users to try out the new heuristic and provide feedback.

<!-- prettier-ignore -->
```js
// Input
eventStore.update(id, _.flow(updater, incrementVersion));

// Output (Prettier stable)
eventStore.update(
  id,
  _.flow(
    updater,
    incrementVersion
  )
);

// Output (Prettier master)
eventStore.update(id, _.flow(updater, incrementVersion));
```

#### Handlebars: Preserve HTML entities ([#6234] by [@gavinjoyce])

<!-- prettier-ignore -->
```hbs
<!-- Input -->
<p>
  Some escaped characters: &lt; &gt; &amp;
</p>

<!-- Output (Prettier stable) -->
<p>
  Some escaped characters: < > &
</p>

<!-- Output (Prettier master) -->
<p>
  Some escaped characters: &lt; &gt; &amp;
</p>
```

#### JavaScript: Stop moving comments inside tagged template literals ([#6236] by [@sosukesuzuki])

<!-- prettier-ignore -->
```js
// Input
foo //comment
`
`;

// Output (Prettier stable)
foo` // comment
`;

// Output (Prettier master)
foo // comment
`
`;
```

#### TypeScript/Flow: Fix moving comments in function calls like `useEffect` ([#6270] by [@sosukesuzuki])

This fixes a bug that was affecting function calls with an arrow function as the first argument and an array expression as the second argument, e.g. React's `useEffect`.
If a comment was placed on the line before the second argument, Prettier would move it to the line above and corrupt the indentation.

The bug was only present when using the Flow and TypeScript parsers.

<!-- prettier-ignore -->
```js
// Input
useEffect(
  () => {
    console.log("some code", props.foo);
  },

  // eslint-disable-line react-hooks/exhaustive-deps
  []
);

// Output (Prettier stable)
useEffect(() => {
  console.log("some code", props.foo);
}, // eslint-disable-line react-hooks/exhaustive-deps
[]);

// Output (Prettier master)
useEffect(
  () => {
    console.log("some code", props.foo);
  },

  // eslint-disable-line react-hooks/exhaustive-deps
  []
);
```

#### TypeScript: Fix crashes when using `//` in JSX texts ([#6289] by [@duailibe])

This version updates the TypeScript parser to correctly handle JSX text with double slashes (`//`). In previous versions, this would cause Prettier to crash.

#### HTML, Vue: Don't wrap `template` elements on lines shorter than `printWidth` ([#6284] by [@sosukesuzuki])

Previously, even if the line length was shorter than `printWidth`, Prettier would break the line with a `template` element.

<!-- prettier-ignore -->
```html
<!-- Input -->
<template>
  <template>foo</template>
</template>

<!-- Output (Prettier stable) -->
<template>
  <template
    >foo</template
  >
</template>

<!-- Output (Prettier master) -->
<template>
  <template>foo</template>
</template>
```

#### HTML: Add support for `&excl;` and other entities ([#6785] by [@lydell])

Previously, Prettier only supported the most common HTML entities, such as `&nbsp;` and `&quot;`. Now, Prettier supports every HTML entity in the HTML spec, such as `&excl;` and `&pitchfork;`.

<!-- prettier-ignore -->
```html
<!-- Input -->
<p>Hi&excl;</p>

<!-- Output (Prettier stable)
[error] stdin: SyntaxError: Unknown entity "excl" - use the "&#<decimal>;" or  "&#x<hex>;" syntax (1:6)
[error] > 1 | <p>Hi&excl;</p>
[error]     |      ^
[error]   2 |
-->

<!-- Output (Prettier master) -->
<p>Hi&excl;</p>
```

#### JavaScript: Empty lines in destructured arrow function parameters could break indentation and idempotence ([#6301] & [#6382] by [@sosukesuzuki])

Previously, Prettier indented code strangely when an arrow function whose parameters included an object pattern was passed to a function call as an argument. Also, it broke idempotence. Please see [#6294](https://github.com/prettier/prettier/issues/6294) for details.

<!-- prettier-ignore -->
```js
// Input
foo(
  ({
    a,

    b
  }) => {}
);

// Output (Prettier stable)
foo(({ a,
  b }) => {});

// Output (Prettier master)
foo(
  ({
    a,

    b
  }) => {}
);
```

#### TypeScript: Put a closing parenthesis onto a new line after union types ([#6307] by [@sosukesuzuki])

<!-- prettier-ignore-->
```ts
// Input
const foo = [abc, def, ghi, jkl, mno, pqr, stu, vwx, yz] as (
  | string
  | undefined
)[];

// Prettier (stable)
const foo = [abc, def, ghi, jkl, mno, pqr, stu, vwx, yz] as (
  | string
  | undefined)[];

// Prettier (master)
const foo = [abc, def, ghi, jkl, mno, pqr, stu, vwx, yz] as (
  | string
  | undefined
)[];
```

#### HTML: Script tags are now treated as blocks for the purposes of formatting ([#6423] by [@thorn0])

Previously, in the [whitespace-sensitive mode](https://prettier.io/docs/en/options.html#html-whitespace-sensitivity), they were formatted as if they were inline.

<!-- prettier-ignore-->
```html
<!-- Input -->
<script
  async
  src="/_next/static/development/pages/_app.js?ts=1565732195968"
></script><script></script>

<!-- Prettier (stable) -->
<script
  async
  src="/_next/static/development/pages/_app.js?ts=1565732195968"
></script
><script></script>

<!-- Prettier (master) -->
<script
  async
  src="/_next/static/development/pages/_app.js?ts=1565732195968"
></script>
<script></script>
```

#### TypeScript: Correctly format long one-line mapped types in one pass ([#6420] by [@sosukesuzuki])

Previously, when Prettier formatted long one-line mapped types, it would break the line but didn’t add a semicolon until you ran Prettier again, which means Prettier’s idempotence rule was broken. Now, Prettier adds the semicolon in the first run.

<!-- prettier-ignore -->
```ts
// Input
type FooBar<T> = { [P in keyof T]: T[P] extends Something ? Something<T[P]> : T[P] }

// Prettier (stable)
type FooBar<T> = {
  [P in keyof T]: T[P] extends Something ? Something<T[P]> : T[P]
};

// Prettier (master)
type FooBar<T> = {
  [P in keyof T]: T[P] extends Something ? Something<T[P]> : T[P];
};
```

#### JavaScript: Fix formatting of object destructuring with parameter decorators ([#6411] by [@sosukesuzuki])

Previously, Prettier formatted decorators for destructured parameters in a weird way. Now, parameter decorators are placed just above the parameter they belong to.

<!-- prettier-ignore -->
```js
// Input
class Class {
  method(
    @decorator
     { foo }
  ) {}
}

// Prettier (stable)
class Class {
  method(@decorator
  {
    foo
  }) {}
}

// Prettier (master)
class Class {
  method(
    @decorator
    { foo }
  ) {}
}
```

#### JavaScript: Handle empty object patterns with type annotations in function parameters ([#6438] by [@bakkot])

<!-- prettier-ignore -->
```js
// Input
const f = ({}: MyVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongType) => {};
function g({}: Foo) {}

// Output (Prettier stable)
const f = ({
  ,
}: MyVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongType) => {};
function g({  }: Foo) {}

// Output (Prettier master)
const f = ({}: MyVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongType) => {};
function g({}: Foo) {}
```

#### JavaScript: Put a closing parenthesis onto a new line after binary expressions within function calls ([#6441] by [@sosukesuzuki])

<!-- prettier-ignore -->
```js
// Input
(
  aaaaaaaaaaaaaaaaaaaaaaaaa &&
  bbbbbbbbbbbbbbbbbbbbbbbbb &&
  ccccccccccccccccccccccccc &&
  ddddddddddddddddddddddddd &&
  eeeeeeeeeeeeeeeeeeeeeeeee
)();

// Prettier (stable)
(aaaaaaaaaaaaaaaaaaaaaaaaa &&
  bbbbbbbbbbbbbbbbbbbbbbbbb &&
  ccccccccccccccccccccccccc &&
  ddddddddddddddddddddddddd &&
  eeeeeeeeeeeeeeeeeeeeeeeee)();

// Prettier (master)
(
  aaaaaaaaaaaaaaaaaaaaaaaaa &&
  bbbbbbbbbbbbbbbbbbbbbbbbb &&
  ccccccccccccccccccccccccc &&
  ddddddddddddddddddddddddd &&
  eeeeeeeeeeeeeeeeeeeeeeeee
)();
```

#### JavaScript: Fix formatting of long named exports ([#6446] by [@sosukesuzuki])

Now, Prettier formats them the same way it formats named imports.

<!-- prettier-ignore -->
```js
// Input
export { fooooooooooooooooooooooooooooooooooooooooooooooooo } from "fooooooooooooooooooooooooooooo";

// Prettier (stable)
export {
  fooooooooooooooooooooooooooooooooooooooooooooooooo
} from "fooooooooooooooooooooooooooooo";

// Prettier (master)
export { fooooooooooooooooooooooooooooooooooooooooooooooooo } from "fooooooooooooooooooooooooooooo";
```

#### JavaScript: Fix bad formatting for multi-line optional chaining with comment ([#6506] by [@sosukesuzuki])

<!-- prettier-ignore -->
```js
// Input
return a
  .b()
  .c()
  // Comment
  ?.d()

// Prettier (stable)
return a
  .b()
  .c()
  ?.// Comment
  d();

// Prettier (master)
return (
  a
    .b()
    .c()
    // Comment
    ?.d()
);
```

#### JavaScript: Fix inconsistent indentation in switch statement ([#6514] by [@sosukesuzuki])

<!-- prettier-ignore -->
```js
// Input
switch ($veryLongAndVeryVerboseVariableName && $anotherVeryLongAndVeryVerboseVariableName) {
}

switch ($longButSlightlyShorterVariableName && $anotherSlightlyShorterVariableName) {
}

// Prettier (stable)
switch (
  $veryLongAndVeryVerboseVariableName &&
    $anotherVeryLongAndVeryVerboseVariableName
) {
}

switch (
  $longButSlightlyShorterVariableName && $anotherSlightlyShorterVariableName
) {
}

// Prettier (master)
switch (
  $veryLongAndVeryVerboseVariableName &&
  $anotherVeryLongAndVeryVerboseVariableName
) {
}

switch (
  $longButSlightlyShorterVariableName &&
  $anotherSlightlyShorterVariableName
) {
}
```

#### TypeScript: Keep type parameters inline for type annotations in variable declarations ([#6467] by [@sosukesuzuki])

<!-- prettier-ignore -->
```ts
// Input
const fooooooooooooooo: SomeThing<boolean> = looooooooooooooooooooooooooooooongNameFunc();

// Prettier (stable)
const fooooooooooooooo: SomeThing<
  boolean
> = looooooooooooooooooooooooooooooongNameFunc();

// Prettier (master)
const fooooooooooooooo: SomeThing<boolean> = looooooooooooooooooooooooooooooongNameFunc();
```

#### Handlebars: Fix `--single-quote` option on HTML attributes ([#6377] by [@dcyriller])

Previously, the flag was not applied on HTML attributes.

<!-- prettier-ignore-->
```hbs
<!-- Input -->
<div class="a-class-name"></div>

<!-- Prettier (stable with the option --single-quote) -->
<div class="a-class-name"></div>

<!-- Prettier (master with the option --single-quote) -->
<div class='a-class-name'></div>
```

#### TypeScript: Sometimes double parentheses around types were removed incorrectly ([#6604] by [@sosukesuzuki])

<!-- prettier-ignore -->
```ts
// Input
type A = 0 extends ((1 extends 2  ? 3 : 4)) ? 5 : 6;
type B = ((0 extends 1 ? 2 : 3)) extends 4 ? 5 : 6;
type C = ((number | string))["toString"];
type D = ((keyof T1))["foo"];

// Prettier (stable)
type A = 0 extends 1 extends 2 ? 3 : 4 ? 5 : 6;
type B = 0 extends 1 ? 2 : 3 extends 4 ? 5 : 6;
type C = number | string["toString"];
type D = keyof T1["foo"];

// Prettier (master)
type A = 0 extends (1 extends 2 ? 3 : 4) ? 5 : 6;
type B = (0 extends 1 ? 2 : 3) extends 4 ? 5 : 6;
type C = (number | string)["toString"];
type D = (keyof T1)["foo"];
```

#### JavaScript: Support formatting code with V8 intrinsics ([#6496] by [@rreverser])

<!-- prettier-ignore -->
```js
// Input
function doSmth()     {
            %DebugPrint
        (
                foo )
  }

// Prettier (stable)
SyntaxError: Unexpected token (2:13)
  1 | function doSmth()     {
> 2 |             %DebugPrint
    |             ^

// Prettier (master)
function doSmth() {
  %DebugPrint(foo);
}
```

#### TypeScript: Sometimes removing parentheses around JSX made the code unparseable ([#6640] by [@sosukesuzuki])

<!-- prettier-ignore -->
```tsx
// Input
(<a />).toString();

// Prettier (stable)
<a />.toString():

// Prettier (master)
(<a />).toString();
```

#### JavaScript: Object destructuring in method parameters always broke into multiple lines ([#6646] by [@ericsakmar])

<!-- prettier-ignore -->
```js
// Input
const obj = {
  func(id, { blog: { title } }) {
    return id + title;
  },
};

class A {
  func(id, { blog: { title } }) {
    return id + title;
  }
  #func(id, { blog: { title } }) {
    return id + title;
  }
}

// Prettier (stable)
const obj = {
  func(
    id,
    {
      blog: { title }
    }
  ) {
    return id + title;
  }
};

class A {
  func(
    id,
    {
      blog: { title }
    }
  ) {
    return id + title;
  }
  #func(
    id,
    {
      blog: { title }
    }
  ) {
    return id + title;
  }
}

// Prettier (master)
const obj = {
  func(id, { blog: { title } }) {
    return id + title;
  },
};

class A {
  func(id, { blog: { title } }) {
    return id + title;
  }
  #func(id, { blog: { title } }) {
    return id + title;
  }
}
```

#### Angular: Put a closing parenthesis onto a new line after ternaries passed to pipes ([#5682] by [@selvazhagan])

<!-- prettier-ignore -->
```html
<!-- Input -->
{{ (isCustomDiscount ? 'DISCOUNTS__DISCOUNT_TRAINING_HEADER__CUSTOM_DISCOUNT' : 'DISCOUNTS__DISCOUNT_TRAINING_HEADER__DISCOUNT') | translate }}

<!-- Output (Prettier stable) -->
{{
  (isCustomDiscount
    ? "DISCOUNTS__DISCOUNT_TRAINING_HEADER__CUSTOM_DISCOUNT"
    : "DISCOUNTS__DISCOUNT_TRAINING_HEADER__DISCOUNT") | translate
}}

<!-- Output (Prettier master) -->
{{
  (isCustomDiscount
    ? "DISCOUNTS__DISCOUNT_TRAINING_HEADER__CUSTOM_DISCOUNT"
    : "DISCOUNTS__DISCOUNT_TRAINING_HEADER__DISCOUNT"
  ) | translate
}}
```

#### Handlebars: Fix handling of whitespace and line breaks ([#6354] by [@chadian])

This fixes a variety of whitespace and line break use cases within Handlebars and Glimmer templates.

<!-- prettier-ignore -->
```hbs
<!-- Input -->
<SomeComponent />{{name}}

Some sentence with  {{dynamic}}  expressions.



sometimes{{nogaps}}areimportant<Hello></Hello>
{{name}}  is your name

<!-- Output (Prettier stable) -->
<SomeComponent />
{{name}}
Some sentence with
{{dynamic}}
expressions.



sometimes
{{nogaps}}
areimportant
<Hello />
{{name}}
is your name

<!-- Output (Prettier master) -->
<SomeComponent />{{name}}

Some sentence with {{dynamic}} expressions.



sometimes{{nogaps}}areimportant
<Hello />
{{name}} is your name
```

#### Angular: Add formatting for `i18n` attributes ([#6695] by [@voithos])

Prettier will auto-wrap the contents of `i18n` attributes once they exceed the line length.

<!-- prettier-ignore -->
```html
<!-- Input -->
<h1 i18n="This is a very long internationalization description text, exceeding the configured print width">
  Hello!
</h1>

<!-- Output (Prettier stable) -->
<h1
  i18n="This is a very long internationalization description text, exceeding the configured print width"
>
  Hello!
</h1>

<!-- Output (Prettier master) -->
<h1
  i18n="
    This is a very long internationalization description text, exceeding the
    configured print width
  "
>
  Hello!
</h1>
```

#### JavaScript: Break arrays of arrays/objects if each element has more than one element/property ([#6694] by [@sosukesuzuki])

<!-- prettier-ignore -->
```js
// Input
test.each([
  { a: "1", b: 1 },
  { a: "2", b: 2 },
  { a: "3", b: 3 }
])("test", ({ a, b }) => {
  expect(Number(a)).toBe(b);
});
[[0, 1, 2], [0, 1, 2]];
new Map([
  [A, B],
  [C, D],
  [E, F],
  [G, H],
  [I, J],
  [K, L],
  [M, N]
]);

// Output (Prettier stable)
test.each([{ a: "1", b: 1 }, { a: "2", b: 2 }, { a: "3", b: 3 }])(
  "test",
  ({ a, b }) => {
    expect(Number(a)).toBe(b);
  }
);
[[0, 1, 2], [0, 1, 2]]
new Map([[A, B], [C, D], [E, F], [G, H], [I, J], [K, L], [M, N]]);

// Output (Prettier master)
test.each([
  { a: "1", b: 1 },
  { a: "2", b: 2 },
  { a: "3", b: 3 }
])("test", ({ a, b }) => {
  expect(Number(a)).toBe(b);
});
[
  [0, 1, 2],
  [0, 1, 2]
];
new Map([
  [A, B],
  [C, D],
  [E, F],
  [G, H],
  [I, J],
  [K, L],
  [M, N]
]);
```

#### TypeScript: Keep semi for a class property before index signature when no-semi is enabled ([#6728] by [@sosukesuzuki])

Attempting to format Prettier’s output again used to result in a syntax error.

<!-- prettier-ignore -->
```ts
// Input
export class User {
  id: number = 2;
  [key: string]: any
}

// Output (Prettier stable)
export class User {
  id: number = 2
  [key: string]: any
}

// Output (Prettier master)
export class User {
  id: number = 2;
  [key: string]: any
}
```

#### Flow: Parentheses around arrow functions' return types that have `FunctionTypeAnnotation` nested in `ObjectTypeAnnotation` ([#6717] by [@sosukesuzuki])

This is a workaround for a [bug](https://github.com/facebook/flow/pull/8163) in the Flow parser. Without the parentheses, the parser throws an error.

```js
// Input
const example1 = (): { p: (string => string) } => (0: any);

// Output (Prettier stable)
const example1 = (): { p: string => string } => (0: any);

// Output (Prettier master)
const example1 = (): ({ p: string => string }) => (0: any);
```

#### CLI: Handle errors when reading stdin ([#6708] by [@andersk] and [@lydell])

If you had an error in your `.prettierrc` Prettier used to crash when formatting stdin. Such errors are now handled properly.

```
# Prettier stable
$ prettier --parser babel < test.js
(node:21531) UnhandledPromiseRejectionWarning: Error: Invalid printWidth value. Expected an integer, but received "nope".
    at _loop (/home/lydell/forks/prettier/node_modules/prettier/bin-prettier.js:7887:63)
    at Normalizer._applyNormalization (/home/lydell/forks/prettier/node_modules/prettier/bin-prettier.js:8000:13)
    at applyNormalization (/home/lydell/forks/prettier/node_modules/prettier/bin-prettier.js:7817:49)
    at Normalizer.normalize (/home/lydell/forks/prettier/node_modules/prettier/bin-prettier.js:7823:9)
    at normalizeOptions$1 (/home/lydell/forks/prettier/node_modules/prettier/bin-prettier.js:8760:31)
    at Object.normalizeApiOptions (/home/lydell/forks/prettier/node_modules/prettier/bin-prettier.js:8918:10)
    at getOptionsForFile (/home/lydell/forks/prettier/node_modules/prettier/bin-prettier.js:44160:69)
    at /home/lydell/forks/prettier/node_modules/prettier/bin-prettier.js:44214:22
    at process._tickCallback (internal/process/next_tick.js:68:7)
(node:21531) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
(node:21531) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

# Prettier master
$ prettier --parser babel < test.js
[error] Invalid printWidth value. Expected an integer, but received "nope".
```

#### CLI: Gracefully handle nonexistent paths passed to --stdin-filepath ([#6687] by [@voithos])

Previously, if you passed a nonexistent subdirectory to --stdin-filepath, Prettier would throw an error. Now, Prettier gracefully handles this.

```
# Prettier stable
$ prettier --stdin-filepath does/not/exist.js < test.js
[error] Invalid configuration file: ENOENT: no such file or directory, scandir '/home/lydell/forks/prettier/does/not'

# Prettier master
$ prettier --stdin-filepath does/not/exist.js < test.js
test;
```

#### JavaScript: Numeric separators were removed from BigInt literals ([#6796] by [@thorn0])

<!-- prettier-ignore -->
```js
// Input
const bigints = [200_000n, 0x0000_000An, 0b0111_1111n];

// Output (Prettier stable)
const bigints = [200000n, 0x0000000an, 0b01111111n];

// Output (Prettier master)
const bigints = [200_000n, 0x0000_000an, 0b0111_1111n];
```

#### VS Code: add support for .mongo files ([#6848] by [@aymericbouzy])

When using the Azure Cosmos DB extension for VS Code, you can create .mongo files to write MongoDB queries, which use Javascript syntax. This change allows VS Code to format your file using Prettier.

```js
db.users.find({ someField: { $exists: true } });
```

#### JavaScript: Better formatting for inline `await` expression nested in calls ([#6856] by [@thorn0])

<!-- prettier-ignore -->
```js
// Input
async function f() {
  const admins = (await(db.select('*').from('admins').leftJoin('bla').where('id', 'in', [1,2,3,4]))).map(({id, name})=>({id, name}))
}

// Output (Prettier stable)
async function f() {
  const admins = (await db
    .select("*")
    .from("admins")
    .leftJoin("bla")
    .where("id", "in", [1, 2, 3, 4])).map(({ id, name }) => ({ id, name }));
}

// Output (Prettier master)
async function f() {
  const admins = (
    await db
      .select("*")
      .from("admins")
      .leftJoin("bla")
      .where("id", "in", [1, 2, 3, 4])
  ).map(({ id, name }) => ({ id, name }));
}
```

#### JavaScript: Don't require parens for same-operator logical expressions ([#6864] by [@jridgewell])

<!-- prettier-ignore -->
```js
// Input
foo && (bar && baz);
foo || (bar || baz);
foo ?? (bar ?? baz);

// Output (Prettier stable)
foo && (bar && baz);
foo || (bar || baz);
foo ?? (bar ?? baz);

// Output (Prettier master)
foo && bar && baz;
foo || bar || baz;
foo ?? bar ?? baz;
```

#### CLI: Display invalid config filename in error message ([#6865] by [@fisker])

<!-- prettier-ignore -->
```bash
# Input
$ prettier filename.js --config .invalid-config

# Output (Prettier stable)
Invalid configuration file: ...

# Output (Prettier master)
Invalid configuration file `.invalid-config`: ...
```

#### Less: don't lowercase variable names, remove whitespace between variable and colon ([#6778] by [@fisker])

<!-- prettier-ignore -->
```less
// Input
@FoO : bar;

// Output (Prettier stable)
@foo : bar;

// Output (Prettier master)
@FoO: bar;
```

#### Vue: Format `style[lang="css"]` ([#6875] by [@fisker])

Previously, `<style>` element with attribute `lang` equals to `css` is not formatted.

<!-- prettier-ignore -->
```html
<!-- Input -->
<style lang="css">
    a { 
color: #F00
}</style>

<!-- Output (Prettier stable) -->
<style lang="css">
    a {
color: #F00
}
</style>

<!-- Output (Prettier master) -->
<style lang="css">
  a {
    color: #f00;
  }
</style>
```

[#5682]: https://github.com/prettier/prettier/pull/5682
[#6657]: https://github.com/prettier/prettier/pull/6657
[#5910]: https://github.com/prettier/prettier/pull/5910
[#6033]: https://github.com/prettier/prettier/pull/6033
[#6186]: https://github.com/prettier/prettier/pull/6186
[#6206]: https://github.com/prettier/prettier/pull/6206
[#6209]: https://github.com/prettier/prettier/pull/6209
[#6217]: https://github.com/prettier/prettier/pull/6217
[#6234]: https://github.com/prettier/prettier/pull/6234
[#6236]: https://github.com/prettier/prettier/pull/6236
[#6270]: https://github.com/prettier/prettier/pull/6270
[#6284]: https://github.com/prettier/prettier/pull/6284
[#6785]: https://github.com/prettier/prettier/pull/6785
[#6289]: https://github.com/prettier/prettier/pull/6289
[#6301]: https://github.com/prettier/prettier/pull/6301
[#6307]: https://github.com/prettier/prettier/pull/6307
[#6332]: https://github.com/prettier/prettier/pull/6332
[#6340]: https://github.com/prettier/prettier/pull/6340
[#6354]: https://github.com/prettier/prettier/pull/6354
[#6377]: https://github.com/prettier/prettier/pull/6377
[#6381]: https://github.com/prettier/prettier/pull/6381
[#6382]: https://github.com/prettier/prettier/pull/6382
[#6397]: https://github.com/prettier/prettier/pull/6397
[#6404]: https://github.com/prettier/prettier/pull/6404
[#6411]: https://github.com/prettier/prettier/pull/6411
[#6412]: https://github.com/prettier/prettier/pull/6412
[#6420]: https://github.com/prettier/prettier/pull/6420
[#6423]: https://github.com/prettier/prettier/pull/6423
[#6438]: https://github.com/prettier/prettier/pull/6411
[#6441]: https://github.com/prettier/prettier/pull/6441
[#6446]: https://github.com/prettier/prettier/pull/6446
[#6467]: https://github.com/prettier/prettier/pull/6467
[#6496]: https://github.com/prettier/prettier/pull/6496
[#6506]: https://github.com/prettier/prettier/pull/6506
[#6514]: https://github.com/prettier/prettier/pull/6514
[#6604]: https://github.com/prettier/prettier/pull/6604
[#6605]: https://github.com/prettier/prettier/pull/6605
[#6640]: https://github.com/prettier/prettier/pull/6640
[#6646]: https://github.com/prettier/prettier/pull/6646
[#6666]: https://github.com/prettier/prettier/pull/6666
[#6673]: https://github.com/prettier/prettier/pull/6673
[#6695]: https://github.com/prettier/prettier/pull/6695
[#6694]: https://github.com/prettier/prettier/pull/6694
[#6717]: https://github.com/prettier/prettier/pull/6717
[#6728]: https://github.com/prettier/prettier/pull/6728
[#6708]: https://github.com/prettier/prettier/pull/6708
[#6687]: https://github.com/prettier/prettier/pull/6687
[#6796]: https://github.com/prettier/prettier/pull/6796
[#6778]: https://github.com/prettier/prettier/pull/6778
[#6848]: https://github.com/prettier/prettier/pull/6848
[#6856]: https://github.com/prettier/prettier/pull/6856
[#6865]: https://github.com/prettier/prettier/pull/6865
[#6875]: https://github.com/prettier/prettier/pull/6875
[#6863]: https://github.com/prettier/prettier/pull/6863
[#6864]: https://github.com/prettier/prettier/pull/6864
[@brainkim]: https://github.com/brainkim
[@duailibe]: https://github.com/duailibe
[@gavinjoyce]: https://github.com/gavinjoyce
[@sosukesuzuki]: https://github.com/sosukesuzuki
[@g-harel]: https://github.com/g-harel
[@jounqin]: https://github.com/JounQin
[@bakkot]: https://gibhub.com/bakkot
[@thorn0]: https://github.com/thorn0
[@dcyriller]: https://github.com/dcyriller
[@rreverser]: https://github.com/RReverser
[@ericsakmar]: https://github.com/ericsakmar
[@squidfunk]: https://github.com/squidfunk
[@vjeux]: https://github.com/vjeux
[@selvazhagan]: https://github.com/selvazhagan
[@chadian]: https://github.com/chadian
[@kaicataldo]: https://github.com/kaicataldo
[@cryrivers]: https://github.com/Cryrivers
[@voithos]: https://github.com/voithos
[@andersk]: https://github.com/andersk
[@lydell]: https://github.com/lydell
[@aymericbouzy]: https://github.com/aymericbouzy
[@fisker]: https://github.com/fisker
[@jridgewell]: https://github.com/jridgewell
