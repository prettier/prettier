import fs from "node:fs/promises";
import { findPackageJSON } from "node:module";

async function _getPackageJson(packageJsonUrl) {
  const packageJson = JSON.parse(await fs.readFile(packageJsonUrl, "utf8"));
  const dependencies = new Set();

  for (const { dependencyType, optional } of [
    { dependencyType: "dependencies", optional: false },
    { dependencyType: "peerDependencies", optional: true },
  ]) {
    if (!packageJson[dependencyType]) {
      continue;
    }

    for (const name of Object.keys(packageJson[dependencyType])) {
      let dependencyPackageJsonUrl;

      try {
        dependencyPackageJsonUrl = findPackageJSON(name, packageJsonUrl);
      } catch (error) {
        if (optional && error.code === "ERR_MODULE_NOT_FOUND") {
          continue;
        }
        throw error;
      }

      dependencies.add({ name, packageJsonUrl: dependencyPackageJsonUrl });
    }
  }

  return {
    name: packageJson.name,
    version: packageJson.version,
    packageJsonUrl,
    dependencies: [...dependencies],
  };
}

const packageJsonCache = new Map();
function getPackageJson(packageJsonUrl) {
  if (!packageJsonCache.has(packageJsonUrl)) {
    packageJsonCache.set(packageJsonUrl, _getPackageJson(packageJsonUrl));
  }

  return packageJsonCache.get(packageJsonUrl);
}

async function getPackageDependencies({
  name,
  base,
  overrideDependencies = new Map(),
  ignoreDependencies = () => false,
}) {
  const packageJsonUrl = findPackageJSON(name, base);
  const packageJsonUrls = new Set();

  const packages = [{ name, packageJsonUrl }];
  while (packages.length > 0) {
    const { name, packageJsonUrl } = packages.pop();
    if (ignoreDependencies(name) || packageJsonUrls.has(packageJsonUrl)) {
      continue;
    }

    packageJsonUrls.add(packageJsonUrl);

    let dependencies;

    if (overrideDependencies.has(name)) {
      dependencies = overrideDependencies.get(name);
    } else {
      ({ dependencies } = await getPackageJson(packageJsonUrl));
    }

    packages.push(...dependencies);
  }

  // Delete self
  packageJsonUrls.delete(packageJsonUrl);

  const [packageJsonData, ...dependencies] = await Promise.all(
    [packageJsonUrl, ...packageJsonUrls].map(async (packageJsonUrl) => {
      const { name, version } = await getPackageJson(packageJsonUrl);
      return { name, version, url: packageJsonUrl };
    }),
  );

  return {
    ...packageJsonData,
    dependencies: dependencies.toSorted(({ name: nameA }, { name: nameB }) =>
      nameA.localeCompare(nameB),
    ),
  };
}

export { getPackageDependencies };
