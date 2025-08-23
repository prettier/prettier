import {
  createPluginSignature,
  extractPluginMetadata,
} from "../../src/main/plugins/plugin-signature.js";

describe("plugin-signature", () => {
  describe("extractPluginMetadata", () => {
    test("extracts metadata from prettierPluginMeta", () => {
      const plugin = {
        prettierPluginMeta: {
          name: "prettier-plugin-example",
          version: "1.2.3",
        },
        parsers: {},
      };

      const result = extractPluginMetadata(plugin);
      expect(result).toEqual({
        name: "prettier-plugin-example",
        version: "1.2.3",
      });
    });

    test("falls back to plugin.name when prettierPluginMeta is not available", () => {
      const plugin = {
        name: "legacy-plugin",
        parsers: {},
      };

      const result = extractPluginMetadata(plugin);
      expect(result).toEqual({
        name: "legacy-plugin",
        version: "unknown",
      });
    });

    test("returns null when no metadata is available", () => {
      const plugin = {
        parsers: {},
      };

      const result = extractPluginMetadata(plugin);
      expect(result).toBeNull();
    });

    test("validates prettierPluginMeta structure", () => {
      const invalidPlugins = [
        { prettierPluginMeta: { name: 123, version: "1.0.0" } },
        { prettierPluginMeta: { name: "test", version: 456 } },
        { prettierPluginMeta: { name: "test" } },
        { prettierPluginMeta: { version: "1.0.0" } },
        { prettierPluginMeta: "invalid" },
        { prettierPluginMeta: null },
      ];

      for (const plugin of invalidPlugins) {
        expect(extractPluginMetadata(plugin)).toBeNull();
      }
    });
  });

  describe("createPluginSignature", () => {
    test("creates empty signature for empty plugin array", () => {
      expect(createPluginSignature([])).toBe("");
      expect(createPluginSignature(undefined)).toBe("");
      expect(createPluginSignature(null)).toBe("");
    });

    test("creates signature for single plugin with metadata", () => {
      const plugins = [
        {
          prettierPluginMeta: {
            name: "prettier-plugin-example",
            version: "1.2.3",
          },
        },
      ];

      const result = createPluginSignature(plugins);
      expect(result).toBe("prettier-plugin-example@1.2.3");
    });

    test("creates signature for multiple plugins with metadata", () => {
      const plugins = [
        {
          prettierPluginMeta: {
            name: "prettier-plugin-b",
            version: "2.0.0",
          },
        },
        {
          prettierPluginMeta: {
            name: "prettier-plugin-a",
            version: "1.0.0",
          },
        },
      ];

      const result = createPluginSignature(plugins);
      // Should be sorted alphabetically by name
      expect(result).toBe("prettier-plugin-a@1.0.0,prettier-plugin-b@2.0.0");
    });

    test("handles mix of plugins with and without metadata", () => {
      const plugins = [
        {
          prettierPluginMeta: {
            name: "prettier-plugin-with-meta",
            version: "1.0.0",
          },
        },
        {
          name: "legacy-plugin",
        },
        {
          parsers: {}, // No metadata at all
        },
      ];

      const result = createPluginSignature(plugins);
      expect(result).toBe("legacy-plugin@unknown,prettier-plugin-with-meta@1.0.0");
    });

    test("creates empty signature when no plugins have metadata", () => {
      const plugins = [
        { parsers: {} },
        { printers: {} },
      ];

      const result = createPluginSignature(plugins);
      expect(result).toBe("");
    });

    test("ensures deterministic ordering", () => {
      const plugins1 = [
        { prettierPluginMeta: { name: "plugin-z", version: "1.0.0" } },
        { prettierPluginMeta: { name: "plugin-a", version: "2.0.0" } },
        { prettierPluginMeta: { name: "plugin-m", version: "3.0.0" } },
      ];

      const plugins2 = [
        { prettierPluginMeta: { name: "plugin-a", version: "2.0.0" } },
        { prettierPluginMeta: { name: "plugin-m", version: "3.0.0" } },
        { prettierPluginMeta: { name: "plugin-z", version: "1.0.0" } },
      ];

      const result1 = createPluginSignature(plugins1);
      const result2 = createPluginSignature(plugins2);
      
      expect(result1).toBe(result2);
      expect(result1).toBe("plugin-a@2.0.0,plugin-m@3.0.0,plugin-z@1.0.0");
    });

    test("handles duplicate plugin names", () => {
      const plugins = [
        { prettierPluginMeta: { name: "same-plugin", version: "1.0.0" } },
        { prettierPluginMeta: { name: "same-plugin", version: "2.0.0" } },
      ];

      const result = createPluginSignature(plugins);
      expect(result).toBe("same-plugin@1.0.0,same-plugin@2.0.0");
    });

    test("handles special characters in plugin names and versions", () => {
      const plugins = [
        {
          prettierPluginMeta: {
            name: "@scope/plugin-name",
            version: "1.0.0-beta.1",
          },
        },
      ];

      const result = createPluginSignature(plugins);
      expect(result).toBe("@scope/plugin-name@1.0.0-beta.1");
    });
  });
});