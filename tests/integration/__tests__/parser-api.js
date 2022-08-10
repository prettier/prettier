import prettier from "../../config/prettier-entry.js";

test("parsers should allow omit optional arguments", async () => {
  let parsers;
  try {
    await prettier.format("{}", {
      plugins: [
        {
          parsers: {
            __dummy: {
              parse(text, options) {
                parsers = options.plugins.flatMap((plugin) =>
                  plugin.parsers
                    ? Object.entries(plugin.parsers).map(
                        ([name, { parse }]) => [name, parse]
                      )
                    : []
                );
              },
              astFormat: "estree",
            },
          },
        },
      ],
      parser: "__dummy",
    });
  } catch {
    // noop
  }

  expect(typeof parsers[0][1]).toBe("function");
  const code = {
    graphql: "type A {hero: Character}",
    default: "{}",
  };
  for (const [name, parse] of parsers) {
    // Private parser should not be used by users
    if (name.startsWith("__")) {
      continue;
    }

    await expect(
      // eslint-disable-next-line require-await
      (async () => parse(code[name] ?? code.default))()
    ).resolves.not.toThrow();
  }
});
