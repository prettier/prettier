import {
  createPluginSignature,
  extractPluginMetadata,
} from "../../src/main/plugins/plugin-signature.js";

describe("plugin-signature", () => {
  describe("extractPluginMetadata", () => {
    test("extracts metadata from meta object", () => {
      const plugin = {
        meta: {
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

    test("returns null when no metadata is available", () => {
      const plugin = {
        parsers: {},
      };

      const result = extractPluginMetadata(plugin);
      expect(result).toBeNull();
    });

    test("validates meta structure", () => {
      const invalidPlugins = [
        { meta: { name: 123, version: "1.0.0" } },
        { meta: { name: "test", version: 456 } },
        { meta: { name: "test" } },
        { meta: { version: "1.0.0" } },
        { meta: "invalid" },
        { meta: null },
      ];

      for (const plugin of invalidPlugins) {
        expect(extractPluginMetadata(plugin)).toBeNull();
      }
    });

    test("ignores plugins without meta object", () => {
      const plugin = {
        name: "legacy-plugin",
        parsers: {},
      };

      const result = extractPluginMetadata(plugin);
      expect(result).toBeNull();
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
          meta: {
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
          meta: {
            name: "prettier-plugin-b",
            version: "2.0.0",
          },
        },
        {
          meta: {
            name: "prettier-plugin-a",
            version: "1.0.0",
          },
        },
      ];

      const result = createPluginSignature(plugins);
      // Should preserve original order, not sort
      expect(result).toBe("prettier-plugin-b@2.0.0,prettier-plugin-a@1.0.0");
    });

    test("handles mix of plugins with and without metadata", () => {
      const plugins = [
        {
          meta: {
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
      // Only plugins with meta should be included
      expect(result).toBe("prettier-plugin-with-meta@1.0.0");
    });

    test("creates empty signature when no plugins have metadata", () => {
      const plugins = [
        { parsers: {} },
        { printers: {} },
      ];

      const result = createPluginSignature(plugins);
      expect(result).toBe("");
    });

    test("preserves original ordering", () => {
      const plugins1 = [
        { meta: { name: "plugin-z", version: "1.0.0" } },
        { meta: { name: "plugin-a", version: "2.0.0" } },
        { meta: { name: "plugin-m", version: "3.0.0" } },
      ];

      const plugins2 = [
        { meta: { name: "plugin-a", version: "2.0.0" } },
        { meta: { name: "plugin-m", version: "3.0.0" } },
        { meta: { name: "plugin-z", version: "1.0.0" } },
      ];

      const result1 = createPluginSignature(plugins1);
      const result2 = createPluginSignature(plugins2);
      
      // Results should be different due to different ordering
      expect(result1).toBe("plugin-z@1.0.0,plugin-a@2.0.0,plugin-m@3.0.0");
      expect(result2).toBe("plugin-a@2.0.0,plugin-m@3.0.0,plugin-z@1.0.0");
      expect(result1).not.toBe(result2);
    });

    test("handles duplicate plugin names", () => {
      const plugins = [
        { meta: { name: "same-plugin", version: "1.0.0" } },
        { meta: { name: "same-plugin", version: "2.0.0" } },
      ];

      const result = createPluginSignature(plugins);
      expect(result).toBe("same-plugin@1.0.0,same-plugin@2.0.0");
    });

    test("handles special characters in plugin names and versions", () => {
      const plugins = [
        {
          meta: {
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