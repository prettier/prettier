import path from "node:path";
import { lstatSafe, normalizeToPosix } from "./utils.js";
import { fastGlob } from "./prettier-internal.js";

/** @typedef {import('./context').Context} Context */

/**
 * @param {Context} context
 */
async function* expandPatterns(context) {
  const seen = new Set();
  let noResults = true;

  for await (const pathOrError of expandPatternsInternal(context)) {
    noResults = false;
    if (typeof pathOrError !== "string") {
      yield pathOrError;
      continue;
    }

    const fileName = path.resolve(pathOrError);

    // filter out duplicates
    if (seen.has(fileName)) {
      continue;
    }

    seen.add(fileName);
    yield fileName;
  }

  if (noResults && context.argv.errorOnUnmatchedPattern !== false) {
    // If there was no files and no other errors, let's yield a general error.
    yield {
      error: `No matching files. Patterns: ${context.filePatterns.join(" ")}`,
    };
  }
}

/**
 * @param {Context} context
 */
async function* expandPatternsInternal(context) {
  // Ignores files in version control systems directories and `node_modules`
  const silentlyIgnoredDirs = [".git", ".sl", ".svn", ".hg"];
  if (context.argv.withNodeModules !== true) {
    silentlyIgnoredDirs.push("node_modules");
  }
  const globOptions = {
    dot: true,
    ignore: silentlyIgnoredDirs.map((dir) => "**/" + dir),
    followSymbolicLinks: false,
  };

  let supportedFilesGlob;
  const cwd = process.cwd();

  /** @type {Array<{ type: 'file' | 'dir' | 'glob'; glob: string; input: string; }>} */
  const entries = [];

  for (const pattern of context.filePatterns) {
    const absolutePath = path.resolve(cwd, pattern);

    if (containsIgnoredPathSegment(absolutePath, cwd, silentlyIgnoredDirs)) {
      continue;
    }

    const stat = await lstatSafe(absolutePath);
    if (stat) {
      if (stat.isSymbolicLink()) {
        yield {
          error: `Explicitly specified pattern "${pattern}" is a symbolic link.`,
        };
      } else if (stat.isFile()) {
        entries.push({
          type: "file",
          glob: escapePathForGlob(fixWindowsSlashes(pattern)),
          input: pattern,
        });
      } else if (stat.isDirectory()) {
        /*
        1. Remove trailing `/`, `fast-glob` can't find files for `src//*.js` pattern
        2. Cleanup dirname, when glob `src/../*.js` pattern with `fast-glob`,
          it returns files like 'src/../index.js'
        */
        const relativePath = path.relative(cwd, absolutePath) || ".";
        const prefix = escapePathForGlob(fixWindowsSlashes(relativePath));
        entries.push({
          type: "dir",
          glob: getSupportedFilesGlob().map((pattern) => `${prefix}/**/${pattern}`),
          input: pattern,
        });
      }
    } else if (pattern[0] === "!") {
      // convert negative patterns to `ignore` entries
      globOptions.ignore.push(fixWindowsSlashes(pattern.slice(1)));
    } else {
      entries.push({
        type: "glob",
        glob: fixWindowsSlashes(pattern),
        input: pattern,
      });
    }
  }

  for (const { type, glob, input } of entries) {
    let result;

    try {
      result = await fastGlob(glob, globOptions);
    } catch ({ message }) {
      /* c8 ignore next 4 */
      yield {
        error: `${errorMessages.globError[type]}: "${input}".\n${message}`,
      };
      continue;
    }

    if (result.length === 0) {
      if (context.argv.errorOnUnmatchedPattern !== false) {
        yield { error: `${errorMessages.emptyResults[type]}: "${input}".` };
      }
    } else {
      yield* sortPaths(result);
    }
  }

  function getSupportedFilesGlob() {
    if (!supportedFilesGlob) {
      const extensions = context.languages.flatMap(
        (lang) => lang.extensions || [],
      );
      const filenames = context.languages.flatMap(
        (lang) => lang.filenames || [],
      );
      supportedFilesGlob = [
        ...extensions.map((ext) => "*" + (ext[0] === "." ? ext : "." + ext)),
        ...filenames,
      ];
    }
    return supportedFilesGlob;
  }
}

const errorMessages = {
  globError: {
    file: "Unable to resolve file",
    dir: "Unable to expand directory",
    glob: "Unable to expand glob pattern",
  },
  emptyResults: {
    file: "Explicitly specified file was ignored due to negative glob patterns",
    dir: "No supported files were found in the directory",
    glob: "No files matching the pattern were found",
  },
};

/**
 * @param {string} absolutePath
 * @param {string} cwd
 * @param {string[]} ignoredDirectories
 */
function containsIgnoredPathSegment(absolutePath, cwd, ignoredDirectories) {
  return path
    .relative(cwd, absolutePath)
    .split(path.sep)
    .some((dir) => ignoredDirectories.includes(dir));
}

/**
 * @param {string[]} paths
 */
function sortPaths(paths) {
  return paths.sort((a, b) => a.localeCompare(b));
}

/**
 * This function should be replaced with `fastGlob.escapePath` when these issues are fixed:
 * - https://github.com/mrmlnc/fast-glob/issues/261
 * - https://github.com/mrmlnc/fast-glob/issues/262
 * @param {string} path
 */
function escapePathForGlob(path) {
  return fastGlob
    .escapePath(
      path.replaceAll("\\", "\0"), // Workaround for fast-glob#262 (part 1)
    )
    .replaceAll("\\!", "@(!)") // Workaround for fast-glob#261
    .replaceAll("\0", "@(\\\\)"); // Workaround for fast-glob#262 (part 2)
}

/**
 * Using backslashes in globs is probably not okay, but not accepting
 * backslashes as path separators on Windows is even more not okay.
 * https://github.com/prettier/prettier/pull/6776#discussion_r380723717
 * https://github.com/mrmlnc/fast-glob#how-to-write-patterns-on-windows
 */
const fixWindowsSlashes = normalizeToPosix;

export { expandPatterns };
