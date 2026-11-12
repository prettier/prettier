import prettier from "../../config/prettier-entry.js";

const parsers = ["typescript", "babel-ts", "oxc-ts", "yuku-ts"];
const declarations = [
  "declare function f(  ): void;",
  'declare module "x";',
  "export declare function f(  ): void;",
  'export declare module "x";',
  "export default function f(  );",
  "export declare function f(  ): { value: string } /* { ; */ ;",
  "for (;;) function f(  );",
  "for (const x of xs) function f(  );",
  "for (const x in xs) function f(  );",
  "while (x) function f(  );",
  "with (x) function f(  );",
  "label: function f(  );",
  "if (x) function f(  );",
  "if (x) function f(); else function g(  );",
  "for (;;) if (x) while (y) label: function f(  );",
  "declare function first();\n// prettier-ignore\nexport declare function f(  ): void;",
  'declare function first();\n// prettier-ignore\nexport declare module "x";',
  "declare function first();\n// prettier-ignore\nfor (;;) function f(  );",
];

async function parse(text, parser) {
  return (await prettier.__debug.parse(text, { parser }, { massage: true }))
    .ast;
}

async function checkRange(
  prefix,
  selected,
  suffix,
  options,
  secondOutput,
  wholeOutput,
) {
  const input = prefix + selected + suffix;
  const formatted = await prettier.format(input, {
    rangeStart: prefix.length,
    rangeEnd: prefix.length + selected.length,
    ...options,
  });
  expect(formatted.slice(0, prefix.length)).toBe(prefix);
  expect(formatted.slice(formatted.length - suffix.length)).toBe(suffix);
  expect(await parse(formatted, options.parser)).toStrictEqual(
    await parse(input, options.parser),
  );

  // Repeat the same selected statements, relocating the end after edits.
  // Removing an optional separator can make the next parse consume an
  // unselected empty statement; that changes the next normalized range.
  const second = await prettier.format(formatted, {
    ...options,
    rangeStart: prefix.length,
    rangeEnd: formatted.length - suffix.length,
  });
  expect(second).toBe(secondOutput ?? formatted);
  expect(await parse(second, options.parser)).toStrictEqual(
    await parse(input, options.parser),
  );

  // Whole-file formatting can change the unselected text, but must agree
  // whether or not this range was formatted first, except when consuming an
  // empty statement changes which node a prettier-ignore comment attaches to.
  const wholeOptions = { parser: options.parser, semi: options.semi };
  const whole = await prettier.format(formatted, wholeOptions);
  expect(await parse(whole, options.parser)).toStrictEqual(
    await parse(input, options.parser),
  );
  expect(whole).toBe(
    wholeOutput ?? (await prettier.format(input, wholeOptions)),
  );
  expect(await prettier.format(whole, wholeOptions)).toBe(whole);
  return formatted;
}

describe.each(parsers)("declaration-only ranges (%s)", (parser) => {
  describe.each([false, true])("semi: %s", (semi) => {
    test.each(declarations)("following block: %s", async (declaration) => {
      await checkRange(
        "const before=0;\n",
        declaration,
        " // trailing { }\n/* between { } */\n{ const live=1; }\nconst after=2;\n",
        { parser, semi },
      );
    });

    test.each(
      [
        ["EOF", "\n", false],
        ["ordinary follower", "\nconst after=1;\n", false],
        ["leading ASI", "\n[call()];\n", false],
        ["string brace", '\n"{";\n', false],
        ["template brace", "\n`{`;\n", false],
        ["regexp brace", "\n/\\{/;\n", false],
        ["object expression", "\n({});\n", false],
        ["comment at EOF", " /* { */\n", false],
        [
          "unselected empty statement",
          "\n; /* { */\n{}\n",
          false,
          "declare function f(): void; /* { */\n{}\n",
        ],
        [
          "ignored empty statement",
          "\n// prettier-ignore\n;\n{}\n",
          false,
          "declare function f(): void;\n// prettier-ignore\n{}\n",
          "const before = 0\ndeclare function f(): void;\n// prettier-ignore\n{\n}\n",
        ],
        ["block", "\n{ const live=1; }\n", true],
        ["ignored block", "\n// prettier-ignore\n{const live=1;}\n", true],
        ["unicode whitespace", "\n\u00a0/* { */\u2003{}\n", true],
        ["unicode line comment", " // {\u2028{}\n", true],
      ].map(([name, suffix, needsSeparator, secondOutput, wholeOutput]) => ({
        name,
        suffix,
        needsSeparator,
        secondOutput,
        wholeOutput,
      })),
    )(
      "$name",
      async ({ suffix, needsSeparator, secondOutput, wholeOutput }) => {
        const prefix = "const before=0;\n";
        const formatted = await checkRange(
          prefix,
          "declare function f(  ): void;",
          suffix,
          { parser, semi },
          !semi && secondOutput ? prefix + secondOutput : undefined,
          !semi ? wholeOutput : undefined,
        );
        expect(formatted).toBe(
          prefix +
            "declare function f(): void" +
            (semi || needsSeparator ? ";" : "") +
            suffix,
        );
      },
    );

    test.each([
      "{ function f(); }",
      "namespace N { export function f(); }",
      "if (x) function f(); else {}",
      "do function f(); while (x);",
      "switch (x) { case 1: function f(); }",
      "class C { static { function f(); } }",
    ])("closed scope: %s", async (selected) => {
      const options = { parser, semi };
      const suffix = "\n{ const live=1; }\n";
      const formatted = await checkRange("", selected, suffix, options);
      expect(formatted).toBe(
        (await prettier.format(selected, options)).trimEnd() + suffix,
      );
    });

    test("ignored exported terminal wrapper", async () => {
      const selected =
        "declare function first();\n// prettier-ignore\nfor (;;) export declare function f(  ): void;";
      const suffix = "\n{ const live=1; }\n";
      if (parser === "yuku-ts") {
        // Yuku rejects the original exported statement body before printing.
        await expect(
          prettier.format(selected + suffix, { parser, semi }),
        ).rejects.toThrow(
          "An export declaration can only be used at the top level",
        );
      } else {
        await checkRange("", selected, suffix, { parser, semi });
      }
    });

    test("indented declaration inside an unselected scope", async () => {
      await checkRange(
        "namespace N {\n  ",
        "export function f(  );",
        "\n  { const live=1; }\n}\n",
        { parser, semi },
      );
    });

    test("embedded TypeScript has its own EOF", async () => {
      const selected =
        "const doc = md`~~~ts\ndeclare function f(  ): void;\n~~~`;";
      const suffix = "\n{ const live=1; }\n";
      const options = { parser, semi };
      const standalone = await prettier.format(selected, options);
      expect(standalone).toContain(
        `declare function f(): void${semi ? ";" : ""}\n`,
      );
      expect(await checkRange("", selected, suffix, options)).toBe(
        standalone.trimEnd() + suffix,
      );
    });

    test("range ending in an empty statement keeps existing normalization", async () => {
      const prefix = "const before=0;\n";
      const suffix = "\n{ const live=1; }\n";
      expect(
        await checkRange(prefix, "declare function f(): void;;;", suffix, {
          parser,
          semi,
        }),
      ).toBe(prefix + "declare function f(): void;;;" + suffix);
    });

    test("empty statements inside the normalized range are removed", async () => {
      const prefix = "const before=0;\n";
      const suffix = "\n{ const live=1; }\n";
      expect(
        await checkRange(
          prefix,
          "declare function f();;;\ndeclare function g();",
          suffix,
          { parser, semi },
        ),
      ).toBe(
        prefix +
          `declare function f()${semi ? ";" : ""}\ndeclare function g();` +
          suffix,
      );
    });

    test.each(["exact", "in-token", "trailing whitespace"])(
      "normalized end: %s",
      async (endpoint) => {
        const input = "declare function f(): void;\n{ const live=1; }\n";
        const rangeEnd =
          endpoint === "exact" ? 26 : endpoint === "in-token" ? 23 : 27;
        const options = { parser, semi, rangeStart: 0, rangeEnd };
        expect(await prettier.format(input, options)).toBe(input);
        expect(
          await prettier.format(await prettier.format(input, options), options),
        ).toBe(input);
      },
    );

    test.each(["lf", "crlf", "cr"])("cursor and %s/BOM", async (endOfLine) => {
      const eol = { lf: "\n", crlf: "\r\n", cr: "\r" }[endOfLine];
      for (const bom of ["", "\uFEFF"]) {
        const prefix = `${bom}const before=0;${eol}`;
        const declaration = "declare function f(  ): void;";
        const suffix = `${eol}{ const live=1; }${eol}`;
        const input = prefix + declaration + suffix;
        const expected = prefix + "declare function f(): void;" + suffix;
        for (const [cursorOffset, expectedCursor] of [
          [bom.length + 5, bom.length + 5],
          [prefix.length, prefix.length],
          [input.indexOf("void") + 2, expected.indexOf("void") + 2],
          [prefix.length + declaration.length, expected.length - suffix.length],
          [input.indexOf("live") + 2, expected.indexOf("live") + 2],
          [input.length, expected.length],
        ]) {
          const options = {
            parser,
            semi,
            rangeStart: prefix.length + 8,
            rangeEnd: input.indexOf("void") + 2,
            cursorOffset,
            endOfLine,
          };
          expect(await prettier.formatWithCursor(input, options)).toStrictEqual(
            {
              formatted: expected,
              cursorOffset: expectedCursor,
              comments: [],
            },
          );
        }
      }
    });

    test("EOL conversion still applies to the whole input", async () => {
      const input =
        "\uFEFFconst before=0;\r\ndeclare function f(  ): void;\r\n{ const live=1; }\r\n";
      const formatted =
        "\uFEFFconst before=0;\ndeclare function f(): void;\n{ const live=1; }\n";
      expect(
        await prettier.formatWithCursor(input, {
          parser,
          semi,
          rangeStart: input.indexOf("declare"),
          rangeEnd: input.indexOf("void") + 2,
          cursorOffset: input.indexOf("live"),
          endOfLine: "lf",
        }),
      ).toStrictEqual({
        formatted,
        cursorOffset: formatted.indexOf("live"),
        comments: [],
      });
    });
  });
});
