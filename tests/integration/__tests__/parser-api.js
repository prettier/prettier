import prettier from "../../config/prettier-entry.js";

const createParsePlugin = (name, parse) => ({
  parsers: { [name]: { parse, astFormat: name } },
  printers: { [name]: { print: () => "printed" } },
});

test("parsers should allow omit optional arguments", async () => {
  const originalText = "a\r\nb";
  let parseFunctionArguments;
  const dummyPlugin = createParsePlugin("__dummy", (...args) => {
    parseFunctionArguments = args;
    return { parsed: true };
  });

  await prettier.format(originalText, {
    plugins: [dummyPlugin],
    parser: "__dummy",
  });

  // Prettier pass `options` as 2nd and 3rd argument
  expect(parseFunctionArguments.length).toBe(3);
  expect(parseFunctionArguments[1]).toBe(parseFunctionArguments[2]);
  expect(parseFunctionArguments[0]).not.toBe(originalText);
  expect(parseFunctionArguments[0]).toBe("a\nb");

  const [, { plugins }] = parseFunctionArguments;

  const parsers = await Promise.all(
    plugins
      .flatMap((plugin) =>
        plugin.parsers
          ? Object.entries(plugin.parsers).map(([name, parser]) => [
              name,
              parser,
            ])
          : [],
      )
      // Private parser should not be used by users
      .filter(([name]) => !name.startsWith("__"))
      .map(async ([name, parser]) => [
        name,
        typeof parser === "function" ? await parser() : parser,
      ]),
  );

  expect(typeof parsers[0][1].parse).toBe("function");
  const code = {
    graphql: "type A {hero: Character}",
    angular: "<div></div>",
  };
  for (const [name, { parse }] of parsers) {
    await expect(
      // eslint-disable-next-line require-await
      (async () => parse(code[name] ?? "{}"))(),
    ).resolves.not.toThrow();
  }
});
