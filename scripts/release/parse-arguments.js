import { parseArgs } from "node:util";

function parseArguments() {
  const {
    values: {
      version,
      repo = "git@github.com:prettier/prettier.git",
      manual = false,
      dry = false,
      "skip-dependencies-install": skipDependenciesInstall = false,
      next = false,
    },
  } = parseArgs({
    options: {
      version: {
        type: "string",
      },
      repo: {
        type: "string",
      },
      dry: {
        type: "boolean",
      },
      manual: {
        type: "boolean",
      },
      "skip-dependencies-install": {
        type: "boolean",
      },
      next: {
        type: "boolean",
      },
    },
  });

  return {
    version,
    repo,
    manual,
    dry,
    skipDependenciesInstall,
    next,
  };
}

export default parseArguments;
