import path from "node:path";

// Ignores files in version control systems directories and `node_modules`
const alwaysIgnoredDirectories = [".git", ".sl", ".svn", ".hg", ".jj"];
const withNodeModules = [...alwaysIgnoredDirectories, "node_modules"];
const cwd = process.cwd();

class DirectoryIgnorer {
  #directories;
  ignorePatterns;

  constructor(shouldIgnoreNodeModules) {
    const directories = shouldIgnoreNodeModules
      ? withNodeModules
      : alwaysIgnoredDirectories;
    const patterns = directories.map((directory) => `**/${directory}`);

    this.#directories = new Set(directories);
    this.ignorePatterns = patterns;
  }

  /**
   * @param {string} absolutePathOrPattern
   */
  shouldIgnore(absolutePathOrPattern) {
    const directoryNames = path
      .relative(cwd, absolutePathOrPattern)
      .split(path.sep);
    return directoryNames.some((directoryName) =>
      this.#directories.has(directoryName),
    );
  }
}

const directoryIgnorerWithNodeModules = new DirectoryIgnorer(
  /* shouldIgnoreNodeModules */ true,
);
const directoryIgnorerWithoutNodeModules = new DirectoryIgnorer(
  /* shouldIgnoreNodeModules */ false,
);

export { directoryIgnorerWithNodeModules, directoryIgnorerWithoutNodeModules };
