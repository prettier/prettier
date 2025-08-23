import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function resolveDir(dir) {
  return fileURLToPath(new URL(`../${dir}/`, import.meta.url));
}

const runCliWithoutGitignore = (dir, args, options) =>
  runCli(dir, [...args, "--ignore-path", ".prettierignore"], options);

describe("--cache with plugin version changes", () => {
  const dir = resolveDir("cli/cache-plugin-invalidation");
  const defaultCacheFile = path.join(
    dir,
    "node_modules/.cache/prettier/.prettier-cache",
  );

  const testFile = path.join(dir, "test.js");
  const testContent = `function test() {
  console.log("test");
}
`;

  // Mock plugin with version 1.0.0
  const pluginV1Content = `
export const prettierPluginMeta = {
  name: "test-plugin",
  version: "1.0.0"
};

export const languages = [
  {
    name: "test-lang",
    parsers: ["test-parser"],
    extensions: [".js"]
  }
];

export const parsers = {
  "test-parser": {
    parse: (text) => ({ type: "Program", body: text }),
    astFormat: "test-ast"
  }
};

export const printers = {
  "test-ast": {
    print: (path) => path.getValue().body
  }
};
`;

  // Mock plugin with version 2.0.0 (same functionality, different version)
  const pluginV2Content = `
export const prettierPluginMeta = {
  name: "test-plugin",
  version: "2.0.0"
};

export const languages = [
  {
    name: "test-lang",
    parsers: ["test-parser"],
    extensions: [".js"]
  }
];

export const parsers = {
  "test-parser": {
    parse: (text) => ({ type: "Program", body: text }),
    astFormat: "test-ast"
  }
};

export const printers = {
  "test-ast": {
    print: (path) => path.getValue().body
  }
};
`;

  const pluginPath = path.join(dir, "test-plugin.js");

  const clean = async () => {
    await fs.rm(path.join(dir, "node_modules"), {
      force: true,
      recursive: true,
    });
    await fs.rm(testFile, { force: true });
    await fs.rm(pluginPath, { force: true });
  };

  beforeAll(async () => {
    await fs.mkdir(dir, { recursive: true });
    await clean();
    await fs.writeFile(testFile, testContent);
  });

  afterEach(clean);
  afterAll(clean);

  it("invalidates cache when plugin version changes", async () => {
    // Create plugin v1.0.0
    await fs.writeFile(pluginPath, pluginV1Content);

    // First run with plugin v1.0.0
    const { stdout: firstStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./test-plugin.js",
      "test.js",
    ]);

    expect(firstStdout).toMatch(/test\.js \d+ms/);
    expect(firstStdout).not.toMatch(/\(cached\)/);

    // Second run with same plugin version (should use cache)
    const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./test-plugin.js",
      "test.js",
    ]);

    expect(secondStdout).toMatch(/test\.js \d+ms \(unchanged\) \(cached\)/);

    // Update plugin to v2.0.0
    await fs.writeFile(pluginPath, pluginV2Content);

    // Third run with updated plugin version (should NOT use cache)
    const { stdout: thirdStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./test-plugin.js",
      "test.js",
    ]);

    expect(thirdStdout).toMatch(/test\.js \d+ms/);
    expect(thirdStdout).not.toMatch(/\(cached\)/);

    // Fourth run with same updated plugin (should use cache again)
    const { stdout: fourthStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./test-plugin.js",
      "test.js",
    ]);

    expect(fourthStdout).toMatch(/test\.js \d+ms \(unchanged\) \(cached\)/);
  });

  it("maintains cache when plugin has no metadata", async () => {
    // Create plugin without metadata
    const pluginWithoutMeta = `
export const languages = [
  {
    name: "test-lang",
    parsers: ["test-parser"],
    extensions: [".js"]
  }
];

export const parsers = {
  "test-parser": {
    parse: (text) => ({ type: "Program", body: text }),
    astFormat: "test-ast"
  }
};

export const printers = {
  "test-ast": {
    print: (path) => path.getValue().body
  }
};
`;

    await fs.writeFile(pluginPath, pluginWithoutMeta);

    // First run
    const { stdout: firstStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./test-plugin.js",
      "test.js",
    ]);

    expect(firstStdout).toMatch(/test\.js \d+ms/);
    expect(firstStdout).not.toMatch(/\(cached\)/);

    // Second run (should use cache since no metadata means no version tracking)
    const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./test-plugin.js",
      "test.js",
    ]);

    expect(secondStdout).toMatch(/test\.js \d+ms \(unchanged\) \(cached\)/);
  });

  it("invalidates cache when plugin is added", async () => {
    // First run without plugin
    const { stdout: firstStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "test.js",
    ]);

    expect(firstStdout).toMatch(/test\.js \d+ms/);
    expect(firstStdout).not.toMatch(/\(cached\)/);

    // Second run without plugin (should use cache)
    const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "test.js",
    ]);

    expect(secondStdout).toMatch(/test\.js \d+ms \(unchanged\) \(cached\)/);

    // Create and add plugin
    await fs.writeFile(pluginPath, pluginV1Content);

    // Third run with plugin (should NOT use cache)
    const { stdout: thirdStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./test-plugin.js",
      "test.js",
    ]);

    expect(thirdStdout).toMatch(/test\.js \d+ms/);
    expect(thirdStdout).not.toMatch(/\(cached\)/);
  });

  it("invalidates cache when plugin is removed", async () => {
    // Create plugin
    await fs.writeFile(pluginPath, pluginV1Content);

    // First run with plugin
    const { stdout: firstStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./test-plugin.js",
      "test.js",
    ]);

    expect(firstStdout).toMatch(/test\.js \d+ms/);
    expect(firstStdout).not.toMatch(/\(cached\)/);

    // Second run with plugin (should use cache)
    const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./test-plugin.js",
      "test.js",
    ]);

    expect(secondStdout).toMatch(/test\.js \d+ms \(unchanged\) \(cached\)/);

    // Third run without plugin (should NOT use cache)
    const { stdout: thirdStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "test.js",
    ]);

    expect(thirdStdout).toMatch(/test\.js \d+ms/);
    expect(thirdStdout).not.toMatch(/\(cached\)/);
  });

  it("handles multiple plugins with different versions", async () => {
    const plugin1Path = path.join(dir, "plugin1.js");
    const plugin2Path = path.join(dir, "plugin2.js");

    const plugin1V1 = `
export const prettierPluginMeta = {
  name: "plugin-1",
  version: "1.0.0"
};
export const parsers = {};
`;

    const plugin1V2 = `
export const prettierPluginMeta = {
  name: "plugin-1",
  version: "2.0.0"
};
export const parsers = {};
`;

    const plugin2V1 = `
export const prettierPluginMeta = {
  name: "plugin-2",
  version: "1.0.0"
};
export const parsers = {};
`;

    // Create both plugins v1
    await fs.writeFile(plugin1Path, plugin1V1);
    await fs.writeFile(plugin2Path, plugin2V1);

    // First run with both plugins v1
    const { stdout: firstStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./plugin1.js",
      "--plugin",
      "./plugin2.js",
      "test.js",
    ]);

    expect(firstStdout).toMatch(/test\.js \d+ms/);
    expect(firstStdout).not.toMatch(/\(cached\)/);

    // Second run with same plugins (should use cache)
    const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./plugin1.js",
      "--plugin",
      "./plugin2.js",
      "test.js",
    ]);

    expect(secondStdout).toMatch(/test\.js \d+ms \(unchanged\) \(cached\)/);

    // Update only plugin1 to v2
    await fs.writeFile(plugin1Path, plugin1V2);

    // Third run with updated plugin1 (should NOT use cache)
    const { stdout: thirdStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./plugin1.js",
      "--plugin",
      "./plugin2.js",
      "test.js",
    ]);

    expect(thirdStdout).toMatch(/test\.js \d+ms/);
    expect(thirdStdout).not.toMatch(/\(cached\)/);

    // Cleanup
    await fs.rm(plugin1Path, { force: true });
    await fs.rm(plugin2Path, { force: true });
  });

  it("uses package.json fallback when plugin has no metadata", async () => {
    const pluginDir = path.join(dir, "plugin-with-package");
    const pluginPath = path.join(pluginDir, "index.js");
    const packageJsonPath = path.join(pluginDir, "package.json");

    // Create plugin directory
    await fs.mkdir(pluginDir, { recursive: true });

    // Plugin without prettierPluginMeta
    const pluginWithoutMeta = `
export const languages = [
  {
    name: "test-lang",
    parsers: ["test-parser"],
    extensions: [".js"]
  }
];

export const parsers = {
  "test-parser": {
    parse: (text) => ({ type: "Program", body: text }),
    astFormat: "test-ast"
  }
};

export const printers = {
  "test-ast": {
    print: (path) => path.getValue().body
  }
};
`;

    // Package.json v1
    const packageV1 = {
      name: "test-plugin-package",
      version: "1.0.0"
    };

    // Package.json v2
    const packageV2 = {
      name: "test-plugin-package",
      version: "2.0.0"
    };

    // Create plugin and package.json v1
    await fs.writeFile(pluginPath, pluginWithoutMeta);
    await fs.writeFile(packageJsonPath, JSON.stringify(packageV1, null, 2));

    // First run with package.json v1
    const { stdout: firstStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./plugin-with-package/index.js",
      "test.js",
    ]);

    expect(firstStdout).toMatch(/test\.js \d+ms/);
    expect(firstStdout).not.toMatch(/\(cached\)/);

    // Second run with same package.json (should use cache)
    const { stdout: secondStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./plugin-with-package/index.js",
      "test.js",
    ]);

    expect(secondStdout).toMatch(/test\.js \d+ms \(unchanged\) \(cached\)/);

    // Update package.json to v2
    await fs.writeFile(packageJsonPath, JSON.stringify(packageV2, null, 2));

    // Third run with updated package.json (should NOT use cache)
    const { stdout: thirdStdout } = await runCliWithoutGitignore(dir, [
      "--cache",
      "--write",
      "--plugin",
      "./plugin-with-package/index.js",
      "test.js",
    ]);

    expect(thirdStdout).toMatch(/test\.js \d+ms/);
    expect(thirdStdout).not.toMatch(/\(cached\)/);

    // Cleanup
    await fs.rm(pluginDir, { force: true, recursive: true });
  });
});