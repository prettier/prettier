<!--

Format:

- Category: Title ([#PR] by [@user])

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

- TypeScript: Correctly handle `//` in TSX ([#5728] by [@JamesHenry])

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

- Range: Fix ranged formatting not using the correct line width ([#6050] by [@mathieulj])

  <!-- prettier-ignore -->
  ```js
  // Input
  function f() {
    if (true) {
      call("this line is 79 chars", "long", "it should", "stay as single line");
    }
  }

  // Output (Prettier stable run with --range-start 30 --range-end 110)
  function f() {
    if (true) {
      call(
        "this line is 79 chars",
        "long",
        "it should",
        "stay as single line"
      );
    }
  }

  // Output (Prettier stable run without range)
  function f() {
    if (true) {
      call("this line is 79 chars", "long", "it should", "stay as single line");
    }
  }

  // Output (Prettier master with and without range)
  function f() {
    if (true) {
      call("this line is 79 chars", "long", "it should", "stay as single line");
    }
  }
  ```

- JavaScript: Fix closure compiler typecasts ([#5947] by [@jridgewell])

  If a closing parenthesis follows after a typecast in an inner expression, the typecast would wrap everything to the that following parenthesis.

  <!-- prettier-ignore -->
  ```js
  // Input
  test(/** @type {!Array} */(arrOrString).length);
  test(/** @type {!Array} */((arrOrString)).length + 1);

  // Output (Prettier stable)
  test(/** @type {!Array} */ (arrOrString.length));
  test(/** @type {!Array} */ (arrOrString.length + 1));

  // Output (Prettier master)
  test(/** @type {!Array} */ (arrOrString).length);
  test(/** @type {!Array} */ (arrOrString).length + 1);
  ```

- JavaScript: respect parenthesis around optional chaining before await ([#6087] by [@evilebottnawi])

  <!-- prettier-ignore -->
  ```js
  // Input
  async function myFunction() {
    var x = (await foo.bar.blah)?.hi;
  }

  // Output (Prettier stable)
  async function myFunction() {
    var x = await foo.bar.blah?.hi;
  }

  // Output (Prettier master)
  async function myFunction() {
    var x = (await foo.bar.blah)?.hi;
  }
  ```

- Handlebars: Fix {{else}}{{#if}} into {{else if}} merging ([#6080] by [@dcyriller])

  <!-- prettier-ignore -->
  ```
  // Input
  {{#if a}}
    a
  {{else}}
    {{#if c}}
      c
    {{/if}}
    e
  {{/if}}

  // Output (Prettier stable)
  {{#if a}}
    a
  {{else if c}}
    c
  e
  {{/if}}

  // Output (Prettier master)
  Code Sample
  {{#if a}}
    a
  {{else}}
    {{#if c}}
      c
    {{/if}}
    e
  {{/if}}
  ```

- JavaScript: Improved multiline closure compiler typecast comment detection ([#6070] by [@yangsu])

  Previously, multiline closure compiler typecast comments with lines that
  start with \* weren't flagged correctly and the subsequent parenthesis were
  stripped. Prettier master fixes this issue.

  <!-- prettier-ignore -->
  ```js
  // Input
  const style =/**
   * @type {{
   *   width: number,
   * }}
  */({
    width,
  });

  // Output (Prettier stable)
  const style =/**
   * @type {{
   *   width: number,
   * }}
  */ {
    width,
  };

  // Output (Prettier master)
  const style =/**
   * @type {{
   *   width: number,
   * }}
  */({
    width,
  });
  ```

- JavaScript: Don't break simple template literals ([#5979] by [@jwbay])

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
