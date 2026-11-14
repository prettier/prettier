#!/usr/bin/env bun
import * as legacy from "../dist/prettier/internal/legacy-cli.mjs";
import * as experimental from "../dist/prettier/internal/experimental-cli.mjs";

const index = process.argv.indexOf("--experimental-cli");
if (process.env.PRETTIER_EXPERIMENTAL_CLI || index !== -1) {
  if (index !== -1) process.argv.splice(index, 1);
  await experimental.__promise;
} else {
  await legacy.run();
}
