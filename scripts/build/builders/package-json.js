import assert from "node:assert/strict";
import path from "node:path";
import projectPackageJson from "../../../package.json" with { type: "json" };
import {
  PRODUCTION_MINIMAL_NODE_JS_VERSION,
  readJson,
  writeJson,
} from "../../utilities/index.js";

const keysToKeep = [
  "name",
  "version",
  "description",
  "bin",
  "repository",
  "funding",
  "homepage",
  "author",
  "license",
  "main",
  "browser",
  "unpkg",
  "exports",
  "engines",
  "files",
  "preferUnplugged",
  "sideEffects",
  "keywords",
];

const publishConfig = {
  access: "public",
  registry: "https://registry.npmjs.org/",
};

function createPackageJsonBuilder({ process }) {
  return async function buildPackageJson({ packageConfig, file }) {
    const { distDirectory, sourceDirectory } = packageConfig;
    const original = await readJson(path.join(sourceDirectory, file.input));
    const packageFiles = packageConfig.modules.flatMap(({ files }) => files);

    let packageJson = {
      ...pick(original, keysToKeep),
      engines: {
        ...original.engines,
        // https://github.com/prettier/prettier/pull/13118#discussion_r922708068
        // Don't delete, event it's the same in package.json
        node: `>=${PRODUCTION_MINIMAL_NODE_JS_VERSION}`,
      },
      type: "commonjs",
      files: packageFiles.map((file) => file.output).sort(),
      publishConfig,
    };

    // Rewrite `bin`
    if (original.bin) {
      let originalBin = original.bin;
      if (original.name === "prettier") {
        originalBin = originalBin.prettier;
      }

      const originalBinFile = path.join(sourceDirectory, originalBin);
      const bin = packageFiles.find(
        (file) =>
          file.input &&
          path.join(sourceDirectory, file.input) === originalBinFile,
      ).output;

      assert.ok(typeof bin === "string");
      packageJson.bin = `./${bin}`;
    }

    if (process) {
      packageJson = await process(packageJson, {
        packageConfig,
        originalPackageJson: original,
        projectPackageJson,
      });
    }

    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        assert.ok(
          typeof version === "string",
          `Dependency '${name}' is missing.`,
        );
      }
      packageJson.dependencies = Object.fromEntries(
        Object.keys(packageJson.dependencies)
          .sort()
          .map((name) => [name, packageJson.dependencies[name]]),
      );
    }

    await writeJson(path.join(distDirectory, file.output), packageJson);
  };
}

function pick(object, keys) {
  keys = new Set(keys);
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => keys.has(key)),
  );
}

export { createPackageJsonBuilder };
