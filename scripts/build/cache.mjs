import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { rollup } from "rollup";
import { PROJECT_ROOT, readJson, writeJson, copyFile } from "./utils.mjs";

class Cache {
  constructor({ cacheDir, distDir, version }) {
    this.cacheDir = cacheDir || required("cacheDir");
    this.distDir = distDir || required("distDir");
    this.manifest = path.join(cacheDir, "manifest.json");
    this.version = version || required("version");
    this.checksums = {};
    this.files = {};
    this.updated = {
      version: this.version,
      checksums: {},
      files: {},
    };
  }

  // Loads the manifest.json file with the information from the last build
  async load() {
    // This should never throw, if it does, let it fail the build
    const lockfile = await fs.readFile(
      path.join(PROJECT_ROOT, "yarn.lock"),
      "utf8"
    );
    const lockfileHash = hashString(lockfile);
    this.updated.checksums["yarn.lock"] = lockfileHash;

    try {
      const { version, checksums, files } = await readJson(this.manifest);

      // Ignore the cache if the version changed
      assert.strictEqual(this.version, version);

      assert.ok(typeof checksums === "object");
      // If yarn.lock changed, rebuild everything
      assert.strictEqual(lockfileHash, checksums["yarn.lock"]);

      assert.ok(typeof files === "object");

      for (const modules of Object.values(files)) {
        assert.ok(Array.isArray(modules));
      }

      this.checksums = checksums;
      this.files = files;
    } catch {
      // noop
    }
  }

  // Run rollup to get the list of files included in the bundle and check if
  // any (or the list itself) have changed.
  // This takes the same rollup config used for bundling to include files that are
  // resolved by specific plugins.
  async checkBundle(id, inputOptions, outputOptions) {
    const files = new Set(this.files[id]);
    const newFiles = (this.updated.files[id] = []);

    let dirty = false;

    const bundle = await rollup(getRollupConfig(inputOptions));
    const { output } = await bundle.generate(outputOptions);

    const modules = output
      .filter((mod) => !/\0/.test(mod.facadeModuleId))
      .map((mod) => [
        path.relative(PROJECT_ROOT, mod.facadeModuleId),
        mod.code,
      ]);

    for (const [id, code] of modules) {
      newFiles.push(id);
      // If we already checked this file for another bundle, reuse the hash
      if (!this.updated.checksums[id]) {
        this.updated.checksums[id] = hashString(code);
      }
      const hash = this.updated.checksums[id];

      // Check if this file changed
      if (!this.checksums[id] || this.checksums[id] !== hash) {
        dirty = true;
      }

      // Check if this file is new
      if (!files.delete(id)) {
        dirty = true;
      }
    }

    // Final check: if any file was removed, `files` is not empty
    return !dirty && files.size === 0;
  }

  async save() {
    const { manifest, updated } = this;

    await writeJson(manifest, updated);

    const files = Object.keys(updated.files);
    for (const file of files) {
      await copyFile(
        path.join(this.distDir, file),
        path.join(this.cacheDir, "files", file)
      );
    }
  }

  async isCached(inputOptions, outputOption) {
    const file = path.relative(this.distDir, outputOption.file);
    const useCache = await this.checkBundle(file, inputOptions, outputOption);

    if (useCache) {
      try {
        await copyFile(
          path.join(this.cacheDir, "files", file),
          path.join(this.distDir, file)
        );

        return true;
      } catch {
        // Proceed to build
      }
    }
    return false;
  }
}

function required(name) {
  throw new Error(name + " is required");
}

function hashString(string) {
  return crypto.createHash("md5").update(string).digest("hex");
}

function getRollupConfig(rollupConfig) {
  return {
    ...rollupConfig,
    onwarn() {},
    plugins: rollupConfig.plugins.filter(
      (plugin) =>
        // We're not interested in dependencies, we already check `yarn.lock`
        plugin.name !== "node-resolve" &&
        // This is really slow, we need this "preflight" to be fast
        plugin.name !== "babel"
    ),
  };
}

export default Cache;
