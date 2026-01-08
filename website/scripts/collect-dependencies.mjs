import assert from "node:assert/strict";
import getDependencies from "package-dependencies-tree";

/**
@import {PackageJson} from 'package-dependencies-tree'
*/

/**
@param {PackageJson} packageJson
@param {{
  overrideDependencies: Map<string, string[]>
  ignoreDependencies = (name) => boolean,
  seen: Set<PackageJson>
}} seen
@returns {Generator<PackageJson>}
*/
function* collectDependencies(packageJson, options) {
  if (!options.seen) {
    options = { ...options, seen: new Set() };
  }

  const { seen, overrideDependencies, ignoreDependencies } = options;

  if (overrideDependencies.has(packageJson.name)) {
    yield* overrideDependencies.get(packageJson.name);
    return;
  }

  for (const { type, optional } of [
    { type: "dependencies", optional: false },
    { type: "peerDependencies", optional: true },
  ]) {
    for (const dependency of packageJson[type].values()) {
      if (ignoreDependencies(dependency.name)) {
        continue;
      }

      const { resolved } = dependency;
      if (!optional) {
        assert.ok(
          resolved,
          `Unable to resolve ${dependency.type} '${dependency.name}@${dependency.version}' from '${dependency.base}'.`,
        );
      }

      if (resolved && !seen.has(resolved)) {
        seen.add(resolved);
        yield resolved;
        yield* collectDependencies(resolved, options);
      }
    }
  }
}

function assertDependenciesUnique(packageJson, dependencies) {
  const versions = new Map();

  for (const dependency of dependencies) {
    assert.ok(
      !versions.has(dependency.name),
      `Multiple version of '${dependency.name}' in dependency tree of '${packageJson.name}', '${versions.get(dependency.name)?.version}' and '${dependency.version}'.`,
    );
    versions.set(dependency.name, dependency);
  }
}

function getPackageDependencies({
  file,
  exclude,
  overrideDependencies = new Map(),
  ignoreDependencies = () => false,
}) {
  return Array.from(
    getDependencies(file).dependencies.entries(),
    ([name, dependency]) => {
      if (exclude.has(name)) {
        return;
      }

      const packageJson = dependency.resolved;

      const dependencies = [
        ...collectDependencies(packageJson, {
          overrideDependencies,
          ignoreDependencies,
        }),
      ].toSorted(({ name: nameA }, { name: nameB }) =>
        nameA.localeCompare(nameB),
      );

      assertDependenciesUnique(packageJson, dependencies);

      return {
        name,
        packageJson,
        dependencies,
      };
    },
  ).filter(Boolean);
}

export { getPackageDependencies };
