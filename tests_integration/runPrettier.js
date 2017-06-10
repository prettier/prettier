/*
 * runPrettier – spawns `prettier` process.
 * Adopted from Jest's integration tests suite.
 */
"use strict";

const path = require("path");
const spawnSync = require("cross-spawn").sync;

const PRETTIER_PATH = path.resolve(__dirname, "../bin/prettier.js");

// return the result of the spawned process:
//  [ 'status', 'signal', 'output', 'pid', 'stdout', 'stderr',
//    'envPairs', 'options', 'args', 'file' ]
function runPrettier(dir, args, options) {
  const isRelative = dir[0] !== "/";

  if (isRelative) {
    dir = path.resolve(__dirname, dir);
  }

  const result = spawnSync(
    PRETTIER_PATH,
    args || [],
    Object.assign({}, options, { cwd: dir })
  );

  result.stdout = result.stdout && result.stdout.toString();
  result.stderr = result.stderr && result.stderr.toString();

  return result;
}

module.exports = runPrettier;
