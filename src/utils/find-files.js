"use strict";

const fs = require("fs");
const path = require("path");
const ignoreModule = require("ignore");
const globParent = require("glob-parent");
const isGlobModule = require("is-glob");
const minimatch = require("minimatch");

function statSync(dir) {
  try {
    return fs.statSync(dir);
  } catch (e) {
    return null;
  }
}

function readdirSync(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (e) {
    return [];
  }
}

function isGlob(glob) {
  return isGlobModule(glob.replace(/\\/g, "/"));
}

function makeDefaultFilter(extensions, filenames) {
  if (!extensions || !extensions.length) {
    return "";
  }

  if (extensions.length === 1) {
    return `*.${extensions[0]}`;
  }

  filenames = new Set(filenames);

  const matchExt = minimatch.filter(
    `*.{${extensions
      .map(ext => (ext.startsWith(".") ? ext.substr(1) : ext))
      .join(",")}}`
  );

  return filepath => {
    const filename = path.basename(filepath);
    return matchExt(filename) || filenames.has(filename);
  };
}

module.exports = function* fileFinder(
  patterns,
  { cwd, extensions, filenames, ignore }
) {
  cwd = cwd || process.cwd();
  ignore = ignoreModule().add(ignore || "");

  const filter = makeDefaultFilter(extensions, filenames);

  const found = new Set();

  for (const pattern of patterns) {
    for (const filepath of getFiles(pattern)) {
      if (!found.has(filepath)) {
        found.add(filepath);
        yield filepath;
      }
    }
  }

  function getFiles(pattern) {
    const abspath = path.resolve(cwd, pattern);

    if (ignore.ignores(abspath)) {
      return [];
    }

    if (isGlob(pattern)) {
      const dir = globParent(abspath);
      const glob = abspath.substr(dir.length + 1);
      const recursive = /\*\*|\\|\//.test(glob);
      const depth = /\*\*/.test(glob) ? Infinity : glob.split(path.sep).length;

      pattern = path.relative(cwd, abspath);
      const filter = minimatch.filter(pattern, { dot: true, matchBase: true });
      return walkDir(dir, { filter, recursive, depth });
    }

    const stat = statSync(abspath);

    if (stat && stat.isFile()) {
      return [abspath];
    } else if (stat && stat.isDirectory()) {
      return walkDir(abspath, { filter });
    }

    return [];
  }

  function* walkDir(root, { filter, recursive = true, depth = Infinity }) {
    const queue = [[root, 1]];

    while (queue.length) {
      const [dir, currDepth] = queue.shift();

      if (ignore.ignores(path.relative(cwd, dir) + path.sep)) {
        continue;
      }

      for (const filename of readdirSync(dir)) {
        const filepath = path.join(dir, filename);
        const stat = statSync(filepath);

        if (!stat) {
          continue;
        }

        const relpath = path.relative(cwd, filepath);

        if (stat.isFile() && filter(relpath)) {
          yield filepath;
        } else if (recursive && stat.isDirectory() && currDepth < depth) {
          queue.push([filepath, currDepth + 1]);
        }
      }
    }
  }
};
