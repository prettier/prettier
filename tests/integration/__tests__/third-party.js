import path from "node:path";
import createEsmUtils from "esm-utils";
import { thirdParty } from "../env.js";
import jestPathSerializer from "../path-serializer.js";

const { require, __dirname } = createEsmUtils(import.meta);
const { cosmiconfig, cosmiconfigSync, isCI } = require(thirdParty);

expect.addSnapshotSerializer(jestPathSerializer);

// This don't has to be the same result as `prettier.resolveConfig`,
// Because we are testing with default `cosmiconfigOptions`
describe("cosmiconfig", () => {
  const configs = [
    {
      title: "prettier.config.cjs",
      dirname: path.join(__dirname, "../cli/config/js/"),
      file: path.join(__dirname, "../cli/config/js/prettier.config.cjs"),
      value: {
        endOfLine: "auto",
        tabWidth: 8,
      },
    },
    {
      title: "package.json",
      dirname: path.join(__dirname, "../cli/config/package/"),
      file: path.join(__dirname, "../cli/config/package/package.json"),
      value: {
        tabWidth: 3,
        overrides: [
          {
            files: "*.ts",
            options: {
              tabWidth: 5,
            },
          },
        ],
      },
    },
  ];

  for (const { title, dirname, file, value } of configs) {
    test(`async version ${title}`, async () => {
      const { config, filepath } = await cosmiconfig("prettier").search(
        dirname
      );
      expect(config).toEqual(value);
      expect(filepath).toBe(file);
    });

    test(`sync version ${title}`, () => {
      const { config, filepath } = cosmiconfigSync("prettier").search(dirname);
      expect(config).toEqual(value);
      expect(filepath).toBe(file);
    });
  }

  // #8815, please make sure this error contains code frame
  test("Invalid json file", () => {
    expect(() => {
      cosmiconfigSync("prettier").search(
        path.join(__dirname, "../cli/config/invalid/broken-json")
      );
    }).toThrowErrorMatchingSnapshot();
  });
});

test("isCI", () => {
  expect(typeof isCI()).toBe("boolean");
});
