import path from "node:path";

import loadExternalConfig from "./load-external-config.js";
import loaders, {
  loadConfigFromPackageJson,
  loadConfigFromPackageYaml,
} from "./loaders.js";

async function loadConfig(configFile) {
  const { base: fileName, ext: extension } = path.parse(configFile);
  const load =
    fileName === "package.json"
      ? loadConfigFromPackageJson
      : fileName === "package.yaml"
        ? loadConfigFromPackageYaml
        : loaders[extension];

  if (!load) {
    throw new Error(
      `No loader specified for extension "${extension || "noExt"}"`,
    );
  }

  let config = await load(configFile);

  if (!config) {
    return;
  }

  /*
  We support external config

  ```json
  {
    "prettier": "my-prettier-config-package-or-file"
  }
  ```
  */
  if (typeof config === "string") {
    config = await loadExternalConfig(config, configFile);
  }

  if (typeof config !== "object") {
    throw new TypeError(
      "Config is only allowed to be an object, " +
        `but received ${typeof config} in "${configFile}"`,
    );
  }

  delete config.$schema;
  return config;
}

export default loadConfig;
