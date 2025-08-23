import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import FormatResultsCache from "../../src/cli/format-results-cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, "temp-cache-test");
const cacheFile = path.join(tempDir, ".test-cache");

describe("FormatResultsCache with plugin signatures", () => {
  let cache;

  beforeEach(async () => {
    await fs.mkdir(tempDir, { recursive: true });
    cache = new FormatResultsCache(cacheFile, "content");
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  const sampleOptions = {
    printWidth: 80,
    tabWidth: 2,
    semi: true,
  };

  const samplePlugins = [
    {
      prettierPluginMeta: {
        name: "prettier-plugin-example",
        version: "1.0.0",
      },
      parsers: {},
    },
  ];

  const updatedPlugins = [
    {
      prettierPluginMeta: {
        name: "prettier-plugin-example",
        version: "2.0.0", // Version changed
      },
      parsers: {},
    },
  ];

  test("cache miss when no cache exists", () => {
    const exists = cache.existsAvailableFormatResultsCache(
      "test.js",
      sampleOptions,
      samplePlugins,
    );
    expect(exists).toBe(false);
  });

  test("cache hit when options and plugins match", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    // Set cache
    cache.setFormatResultsCache(testFile, sampleOptions, samplePlugins);
    cache.reconcile();

    // Check cache
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
      samplePlugins,
    );
    expect(exists).toBe(true);
  });

  test("cache miss when plugin version changes", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    // Set cache with original plugins
    cache.setFormatResultsCache(testFile, sampleOptions, samplePlugins);
    cache.reconcile();

    // Check cache with updated plugins (different version)
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
      updatedPlugins,
    );
    expect(exists).toBe(false);
  });

  test("cache hit when no plugins provided (backward compatibility)", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    // Set cache without plugins
    cache.setFormatResultsCache(testFile, sampleOptions);
    cache.reconcile();

    // Check cache without plugins
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
    );
    expect(exists).toBe(true);
  });

  test("cache miss when plugins added to previously plugin-less cache", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    // Set cache without plugins
    cache.setFormatResultsCache(testFile, sampleOptions);
    cache.reconcile();

    // Check cache with plugins
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
      samplePlugins,
    );
    expect(exists).toBe(false);
  });

  test("cache miss when plugins removed from previously plugin-enabled cache", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    // Set cache with plugins
    cache.setFormatResultsCache(testFile, sampleOptions, samplePlugins);
    cache.reconcile();

    // Check cache without plugins
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
    );
    expect(exists).toBe(false);
  });

  test("cache hit with multiple plugins in different order", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const plugins1 = [
      {
        prettierPluginMeta: { name: "plugin-b", version: "1.0.0" },
      },
      {
        prettierPluginMeta: { name: "plugin-a", version: "2.0.0" },
      },
    ];

    const plugins2 = [
      {
        prettierPluginMeta: { name: "plugin-a", version: "2.0.0" },
      },
      {
        prettierPluginMeta: { name: "plugin-b", version: "1.0.0" },
      },
    ];

    // Set cache with first order
    cache.setFormatResultsCache(testFile, sampleOptions, plugins1);
    cache.reconcile();

    // Check cache with second order (should hit due to deterministic sorting)
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
      plugins2,
    );
    expect(exists).toBe(true);
  });

  test("cache miss when plugin added to existing plugin set", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const originalPlugins = [
      {
        prettierPluginMeta: { name: "plugin-a", version: "1.0.0" },
      },
    ];

    const expandedPlugins = [
      {
        prettierPluginMeta: { name: "plugin-a", version: "1.0.0" },
      },
      {
        prettierPluginMeta: { name: "plugin-b", version: "1.0.0" },
      },
    ];

    // Set cache with original plugins
    cache.setFormatResultsCache(testFile, sampleOptions, originalPlugins);
    cache.reconcile();

    // Check cache with expanded plugins
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
      expandedPlugins,
    );
    expect(exists).toBe(false);
  });

  test("cache hit with plugins without metadata", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const pluginsWithoutMeta = [
      { parsers: {} }, // No metadata
      { name: "legacy-plugin" }, // Legacy name only
    ];

    // Set cache
    cache.setFormatResultsCache(testFile, sampleOptions, pluginsWithoutMeta);
    cache.reconcile();

    // Check cache
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
      pluginsWithoutMeta,
    );
    expect(exists).toBe(true);
  });

  test("cache miss when options change with same plugins", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const differentOptions = {
      ...sampleOptions,
      printWidth: 120, // Changed option
    };

    // Set cache with original options
    cache.setFormatResultsCache(testFile, sampleOptions, samplePlugins);
    cache.reconcile();

    // Check cache with different options
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      differentOptions,
      samplePlugins,
    );
    expect(exists).toBe(false);
  });
});