import { ConfigError } from "../../src/common/errors.js";
import { getParserPluginByParserName } from "../../src/main/parser-and-printer.js";
import createPlugin from "../config/utils/create-plugin.cjs";

describe("unit tests for getParserPluginByParserName", () => {
  const getMockPlugins = (name) => [
    { name: "prettier-plugin-do-not-have-parsers" },
    createPlugin({ name, print: () => "test" }),
  ];

  const { env } = process;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  test.each([
    { falsyValue: "" },
    { falsyValue: 0 },
    { falsyValue: -0 },
    { falsyValue: 0n },
    { falsyValue: Number.NaN },
    { falsyValue: null },
    { falsyValue: undefined },
    { falsyValue: false },
  ])("throws an error when parserName is $falsyValue", ({ falsyValue }) => {
    const plugins = getMockPlugins(`${falsyValue}`);
    expect(() => getParserPluginByParserName(plugins, falsyValue)).toThrow(
      "parserName is required.",
    );
  });

  it("throws a ConfigError when no matching plugin is found", () => {
    const func = () => getParserPluginByParserName(getMockPlugins("a"), "b");
    expect(process.env.PRETTIER_TARGET).not.toBe("universal");
    expect(func).toThrow(ConfigError);
    expect(func).toThrow(`Couldn't resolve parser "b".`);
    // When PRETTIER_TARGET is not set to universal, the message below should not be added.
    expect(func).not.toThrow(
      "Plugins must be explicitly added to the standalone bundle.",
    );
  });

  it(`has a specific ConfigError message when process.env.PRETTIER_TARGET === "universal" and no matching plugin is found`, () => {
    process.env.PRETTIER_TARGET = "universal";
    const func = () => getParserPluginByParserName(getMockPlugins("a"), "b");
    expect(func).toThrow(ConfigError);
    expect(func).toThrow(`Couldn't resolve parser "b".`);
    expect(func).toThrow(
      "Plugins must be explicitly added to the standalone bundle.",
    );
  });

  it("returns the last plugin with a matching parser name", () => {
    const name = "somePlugin";
    const plugins = [...getMockPlugins(name), ...getMockPlugins(name)];
    const lastMatchingPlugin = plugins.at(-1);

    expect(getParserPluginByParserName(plugins, name)).toBe(lastMatchingPlugin);
  });
});
