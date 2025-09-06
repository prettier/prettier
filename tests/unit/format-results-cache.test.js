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
    plugins: [
      {
        meta: {
          name: "prettier-plugin-example",
          version: "1.0.0",
        },
        parsers: {},
      },
    ],
  };

  const updatedOptions = {
    printWidth: 80,
    tabWidth: 2,
    semi: true,
    plugins: [
      {
        meta: {
          name: "prettier-plugin-example",
          version: "2.0.0", // Version changed
        },
        parsers: {},
      },
    ],
  };

  test("cache miss when no cache exists", () => {
    const exists = cache.existsAvailableFormatResultsCache(
      "test.js",
      sampleOptions,
    );
    expect(exists).toBe(false);
  });

  test("cache hit when options and plugins match", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    // Set cache
    cache.setFormatResultsCache(testFile, sampleOptions);
    cache.reconcile();

    // Check cache
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
    );
    expect(exists).toBe(true);
  });

  test("cache miss when plugin version changes", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    // Set cache with original options
    cache.setFormatResultsCache(testFile, sampleOptions);
    cache.reconcile();

    // Check cache with updated options (different plugin version)
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      updatedOptions,
    );
    expect(exists).toBe(false);
  });

  test("cache hit when no plugins provided (backward compatibility)", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const optionsWithoutPlugins = {
      printWidth: 80,
      tabWidth: 2,
      semi: true,
    };
    
    // Set cache without plugins
    cache.setFormatResultsCache(testFile, optionsWithoutPlugins);
    cache.reconcile();

    // Check cache without plugins
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      optionsWithoutPlugins,
    );
    expect(exists).toBe(true);
  });

  test("cache miss when plugins added to previously plugin-less cache", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const optionsWithoutPlugins = {
      printWidth: 80,
      tabWidth: 2,
      semi: true,
    };
    
    // Set cache without plugins
    cache.setFormatResultsCache(testFile, optionsWithoutPlugins);
    cache.reconcile();

    // Check cache with plugins
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      sampleOptions,
    );
    expect(exists).toBe(false);
  });

  test("cache miss when plugins removed from previously plugin-enabled cache", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const optionsWithoutPlugins = {
      printWidth: 80,
      tabWidth: 2,
      semi: true,
    };
    
    // Set cache with plugins
    cache.setFormatResultsCache(testFile, sampleOptions);
    cache.reconcile();

    // Check cache without plugins
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      optionsWithoutPlugins,
    );
    expect(exists).toBe(false);
  });

  test("cache miss with multiple plugins in different order", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const options1 = {
      printWidth: 80,
      tabWidth: 2,
      semi: true,
      plugins: [
        {
          meta: { name: "plugin-b", version: "1.0.0" },
        },
        {
          meta: { name: "plugin-a", version: "2.0.0" },
        },
      ],
    };

    const options2 = {
      printWidth: 80,
      tabWidth: 2,
      semi: true,
      plugins: [
        {
          meta: { name: "plugin-a", version: "2.0.0" },
        },
        {
          meta: { name: "plugin-b", version: "1.0.0" },
        },
      ],
    };

    // Set cache with first order
    cache.setFormatResultsCache(testFile, options1);
    cache.reconcile();

    // Check cache with second order (should miss due to different order)
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      options2,
    );
    expect(exists).toBe(false);
  });

  test("cache miss when plugin added to existing plugin set", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const originalOptions = {
      printWidth: 80,
      tabWidth: 2,
      semi: true,
      plugins: [
        {
          meta: { name: "plugin-a", version: "1.0.0" },
        },
      ],
    };

    const expandedOptions = {
      printWidth: 80,
      tabWidth: 2,
      semi: true,
      plugins: [
        {
          meta: { name: "plugin-a", version: "1.0.0" },
        },
        {
          meta: { name: "plugin-b", version: "1.0.0" },
        },
      ],
    };

    // Set cache with original options
    cache.setFormatResultsCache(testFile, originalOptions);
    cache.reconcile();

    // Check cache with expanded options
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      expandedOptions,
    );
    expect(exists).toBe(false);
  });

  test("cache hit with plugins without metadata", async () => {
    // Create a test file first
    const testFile = path.join(tempDir, "test.js");
    await fs.writeFile(testFile, "console.log('test');");
    
    const optionsWithPluginsWithoutMeta = {
      printWidth: 80,
      tabWidth: 2,
      semi: true,
      plugins: [
        { parsers: {} }, // No metadata
        { name: "legacy-plugin" }, // Legacy name only
      ],
    };

    // Set cache
    cache.setFormatResultsCache(testFile, optionsWithPluginsWithoutMeta);
    cache.reconcile();

    // Check cache
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      optionsWithPluginsWithoutMeta,
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
    cache.setFormatResultsCache(testFile, sampleOptions);
    cache.reconcile();

    // Check cache with different options
    const exists = cache.existsAvailableFormatResultsCache(
      testFile,
      differentOptions,
    );
    expect(exists).toBe(false);
  });
});