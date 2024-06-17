import { ConfigError } from "../../src/common/errors.js";
import { getPrinterPluginByAstFormat } from "../../src/main/parser-and-printer.js";
import createPlugin from "../config/utils/create-plugin.cjs";

describe("unit tests for getPrinterPluginByAstFormat", () => {
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
  ])("throws an error when astFormat is $falsyValue", ({ falsyValue }) => {
    const plugins = getMockPlugins(`${falsyValue}`);
    expect(() => getPrinterPluginByAstFormat(plugins, falsyValue)).toThrow(
      "astFormat is required.",
    );
  });

  it("throws a ConfigError when no matching plugin is found", () => {
    const func = () => getPrinterPluginByAstFormat(getMockPlugins("a"), "b");
    expect(process.env.PRETTIER_TARGET).not.toBe("universal");
    expect(func).toThrow(ConfigError);
    expect(func).toThrow(`Couldn't find plugin for AST format "b".`);
    // When PRETTIER_TARGET is not set to universal, the message below should not be added.
    expect(func).not.toThrow(
      "Plugins must be explicitly added to the standalone bundle.",
    );
  });

  it(`has a specific ConfigError message when process.env.PRETTIER_TARGET === "universal" and no matching plugin is found`, () => {
    process.env.PRETTIER_TARGET = "universal";
    const func = () => getPrinterPluginByAstFormat(getMockPlugins("a"), "b");
    expect(func).toThrow(ConfigError);
    expect(func).toThrow(`Couldn't find plugin for AST format "b".`);
    expect(func).toThrow(
      "Plugins must be explicitly added to the standalone bundle.",
    );
  });

  it("returns the last plugin with a matching printer & astFormat", () => {
    const name = "somePlugin";
    const plugins = [...getMockPlugins(name), ...getMockPlugins(name)];
    const lastMatchingPlugin = plugins.at(-1);

    expect(getPrinterPluginByAstFormat(plugins, name)).toBe(lastMatchingPlugin);
  });
});
