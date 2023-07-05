import prettier from "../../config/prettier-entry.js";

const {
  doc: {
    builders: { hardline },
  },
  format,
} = prettier;

function makePlugin(withOutdatedApi = false) {
  return {
    parsers: {
      // parsers leak across tests, so the name needs to be unique
      [withOutdatedApi ? "baz-parser-outdated" : "baz-parser"]: {
        parse: (text) => ({
          type: "root",
          lines: text
            .trim()
            .split("\n")
            .map((line) => ({
              type: line.startsWith("{") ? "json" : "plain",
              text: line,
            })),
        }),
        astFormat: "baz-ast",
      },
    },
    printers: {
      "baz-ast": {
        print(path, options, print) {
          const { type, text } = path.getValue();
          switch (type) {
            case "root":
              return path.map(print, "lines");
            case "json":
            case "plain":
              return [text, hardline];
          }
        },
        embed: withOutdatedApi
          ? (path, print, textToDoc) => {
              const { type, text } = path.getValue();
              if (type === "json") {
                return [
                  textToDoc(text, {
                    parser: "json",
                    printWidth: Number.POSITIVE_INFINITY,
                  }),
                  hardline,
                ];
              }
            }
          : (path) => {
              const { type, text } = path.getValue();
              if (type === "json") {
                return async (textToDoc) => [
                  await textToDoc(text, {
                    parser: "json",
                    printWidth: Number.POSITIVE_INFINITY,
                  }),
                  hardline,
                ];
              }
            },
      },
    },
  };
}

const input = `abcdef
{   "foo":  "bar"}
1234`;

describe("embed API in plugins", () => {
  test("with new signature should work", async () => {
    expect(
      await format(input, {
        plugins: [makePlugin()],
        parser: "baz-parser",
      }),
    ).toMatchSnapshot();
  });

  test("with outdated signature should cause error", async () => {
    await expect(
      format(input, {
        plugins: [makePlugin(true)],
        parser: "baz-parser-outdated",
      }),
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
