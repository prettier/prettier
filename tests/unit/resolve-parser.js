import { resolveParser } from "../../src/main/parser-and-printer.js";

test("resolveParser should not trigger the plugin.parsers getters", async () => {
  const gettersCalledTimes = {};
  const rightParser = {};
  const wrongParser = {};
  const createParserDescriptors = (names) =>
    Object.fromEntries(
      names.map((name) => {
        gettersCalledTimes[name] = 0;
        return [
          name,
          {
            get() {
              gettersCalledTimes[name]++;
              return rightParser;
            },
          },
        ];
      }),
    );
  const creatParsers = (names) =>
    Object.defineProperties(
      Object.create(null),
      createParserDescriptors(names),
    );

  const options = {
    plugins: [
      {
        parsers: new (class {
          get d() {
            return wrongParser;
          }
        })(),
      },
      { name: "prettier-plugin-do-not-have-parsers" },
      { parsers: creatParsers(["a", "b"]) },
      { parsers: creatParsers(["c", "d", "e"]) },
    ],
    parser: "d",
  };

  const result = await resolveParser(options);
  expect(gettersCalledTimes).toStrictEqual({ a: 0, b: 0, c: 0, d: 1, e: 0 });
  expect(result).toBe(rightParser);
  expect(options.plugins[0].parsers.d).toBe(wrongParser);
});
