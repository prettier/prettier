"use strict";

const path = require("path");
const fs = require("fs");
const globby = require("globby");
const fastGlob = require("fast-glob");
const flat = require("lodash/flatten");

/** @typedef {import('./util').Context} Context */

/**
 * @param {Context} context
 */
function* expandPatterns(context) {
  const cwd = process.cwd();
  const seen = Object.create(null);
  let noResults = true;

  for (const pathOrError of expandPatternsInternal(context)) {
    noResults = false;
    if (typeof pathOrError !== "string") {
      yield pathOrError;
      continue;
    }

    const relativePath = path.relative(cwd, pathOrError);

    // filter out duplicates
    if (relativePath in seen) {
      continue;
    }

    seen[relativePath] = true;
    yield relativePath;
  }

  if (noResults) {
    // If there was no files and no other errors, let's yield a general error.
    yield {
      error: `No matching files. Patterns: ${context.filePatterns.join(" ")}`
    };
  }
}

// TODO: use `fast-glob` directly, without `globby`
const baseGlobbyOptions = {
  dot: true,
  expandDirectories: false,
  absolute: true
};

/**
 * @param {Context} context
 */
function* expandPatternsInternal(context) {
  // Ignores files in version control systems directories and `node_modules`
  const ignoredDirectories = {
    ".git": true,
    ".svn": true,
    ".hg": true,
    node_modules: context.argv["with-node-modules"] !== true
  };

  const globbyOptions = {
    ...baseGlobbyOptions,
    ignore: Object.keys(ignoredDirectories)
      .filter(dir => ignoredDirectories[dir])
      .map(dir => "**/" + dir)
  };

  let supportedFilesGlob;
  const cwd = process.cwd();

  /**
   * @type {Array<{
   *  type: 'file' | 'dir' | 'glob';
   *  absolutePath?: string;
   *  glob?: string;
   *  input: string;
   * }>}
   */
  const entries = [];

  for (const pattern of context.filePatterns) {
    const absolutePath = path.resolve(cwd, pattern);

    if (containsIgnoredPathSegment(absolutePath, cwd, ignoredDirectories)) {
      continue;
    }

    const stat = statSafeSync(absolutePath);
    if (stat) {
      if (stat.isFile()) {
        entries.push({ type: "file", absolutePath, input: pattern });
      } else if (stat.isDirectory()) {
        entries.push({
          type: "dir",
          absolutePath,
          glob: escapePathForGlob(pattern) + "/" + getSupportedFilesGlob(),
          input: pattern
        });
      }
    } else if (pattern[0] === "!") {
      // convert negative patterns to `ignore` entries
      globbyOptions.ignore.push(fixWindowsSlashes(pattern.slice(1)));
    } else {
      entries.push({
        type: "glob",
        glob: fixWindowsSlashes(pattern),
        input: pattern
      });
    }
  }

  for (const { type, absolutePath, glob, input } of entries) {
    switch (type) {
      case "file":
        yield absolutePath;
        continue;

      case "dir": {
        let result;
        try {
          result = globby.sync(glob, globbyOptions);
        } catch ({ message }) {
          yield { error: `Unable to expand directory: ${input}\n${message}` };
          continue;
        }

        if (result.length === 0) {
          yield {
            error: `No supported files were found in the directory "${input}".`
          };
        } else {
          yield* sortPaths(result);
        }
        continue;
      }

      case "glob": {
        let result;
        try {
          result = globby.sync(glob, globbyOptions);
        } catch ({ message }) {
          yield {
            error: `Unable to expand glob pattern: ${input}\n${message}`
          };
          continue;
        }

        if (result.length === 0) {
          yield {
            error: `No files matching the pattern "${input}" were found.`
          };
        } else {
          yield* sortPaths(result);
        }
        continue;
      }
    }
  }

  function getSupportedFilesGlob() {
    if (!supportedFilesGlob) {
      const extensions = flat(
        context.languages.map(lang => lang.extensions || [])
      );
      const filenames = flat(
        context.languages.map(lang => lang.filenames || [])
      );
      supportedFilesGlob = `**/{${extensions
        .map(ext => "*" + (ext[0] === "." ? ext : "." + ext))
        .concat(filenames)}}`;
    }
    return supportedFilesGlob;
  }
}

/**
 * @param {string} absolutePath
 * @param {string} cwd
 * @param {Record<string, boolean>} ignoredDirectories
 */
function containsIgnoredPathSegment(absolutePath, cwd, ignoredDirectories) {
  return path
    .relative(cwd, absolutePath)
    .split(path.sep)
    .some(dir => ignoredDirectories[dir]);
}

/**
 * @param {string[]} paths
 */
function sortPaths(paths) {
  return paths.sort((a, b) => a.localeCompare(b));
}

/**
 * Get stats of a given path.
 * @param {string} filePath The path to target file.
 * @returns {fs.Stats | undefined} The stats.
 */
function statSafeSync(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    /* istanbul ignore next */
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

/**
 * @param {string} path
 */
function escapePathForGlob(path) {
  return fastGlob.escapePath(path).replace(/\\!/g, "@(!)");
}

const isWindows = path.sep === "\\";

// Using backslashes in globs is probably not okay, but not accepting
// backslashes as path separators on Windows is even more not okay.
// https://github.com/prettier/prettier/pull/6776#discussion_r380723717
// https://github.com/mrmlnc/fast-glob#how-to-write-patterns-on-windows
/**
 * @param {string} pattern
 */
function fixWindowsSlashes(pattern) {
  return isWindows ? pattern.replace(/\\/g, "/") : pattern;
}

module.exports = expandPatterns;
