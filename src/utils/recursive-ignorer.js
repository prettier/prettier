"use strict";

const ignore = require("ignore");
const os = require("os");
const path = require("path");
const isDirectory = require("./is-directory");
const getFileContentOrNull = require("./get-file-content-or-null");

/**
 * A `RecursiveIgnorer` checks if a file should be ignored,
 * by searching `.prettierignore` in the file's directory and parent directoies.
 *
 * A drop-in replacement for an `ignore()` object,
 * which must be fed rules manually instead of reading them from the filesytem.
 */
class RecursiveIgnorer {
  /**
   * @param {boolean} [withNodeModules] automatically exclude node_modules directories?
   */
  constructor(withNodeModules) {
    this.withNodeModules = withNodeModules;
  }

  /**
   *
   * @param {string} filePath file being checked, either relative to cwd or absolute
   *
   * @returns Should prettier skip processing this file, based on `.prettierignore`?
   */
  ignores(filePath) {
    filePath = path.resolve(filePath);
    const root = RecursiveIgnorer.repoRoot(filePath);
    const relativePath = path.relative(root, filePath);
    return RecursiveIgnorer.isIgnored(root, relativePath, this.withNodeModules);
  }

  /**
   *
   * @param {string} filePath file being checked
   *
   * @returns true if the file should be processed, false otherwise
   */
  test(filePath) {
    return !this.ignores(filePath);
  }

  /**
   * @param {string[]} filePaths files being checked
   *
   * Filter out files rejected because of `.prettierignore`.
   */
  filter(filePaths) {
    return filePaths.filter(filePath => !this.ignores(filePath));
  }

  /**
   * @param {string} startingDir
   * @returns directory of git/svn/hg repo containing `startingDir`
   *
   * Also stops at $HOME or / if those are reached first.
   */
  static repoRoot(startingDir) {
    const homedir = os.homedir();
    let dir = startingDir;
    while (
      // root directory, "/" or "C:\"
      path.dirname(dir) !== dir &&
      // stop at $HOME
      dir !== homedir &&
      // stop at repo root
      !isDirectory(path.join(dir, ".git")) &&
      !isDirectory(path.join(dir, ".svn")) &&
      !isDirectory(path.join(dir, ".hg"))
    ) {
      dir = path.dirname(dir);
    }
    return dir;
  }

  /**
   * @param {string} root directory of git/svn/hg repo
   * @param {string} relativePath path of file being checked for ignoring
   * @param {boolean} withNodeModules automatically exclude node_modules directory?
   *
   * Adapted from https://github.com/isomorphic-git/isomorphic-git/blob/885db9c/src/managers/GitIgnoreManager.js.
   */
  static isIgnored(root, relativePath, withNodeModules) {
    // Find all the .prettierignore files that could affect this file
    const pairs = [
      {
        ignoreFile: path.join(root, ".prettierignore"),
        filepath: relativePath
      }
    ];
    const pieces = relativePath.split(path.sep);
    for (let i = 1; i < pieces.length; i++) {
      const folder = pieces.slice(0, i).join(path.sep);
      const file = pieces.slice(i).join(path.sep);
      pairs.push({
        ignoreFile: path.join(root, folder, ".prettierignore"),
        filepath: file
      });
    }
    let ignoredStatus = false;
    for (const { filepath, ignoreFile } of pairs) {
      const file = getFileContentOrNull.sync(ignoreFile);
      if (file === null) {
        continue;
      }
      // @ts-ignore
      const ign = ignore().add(file);
      if (!withNodeModules) {
        ign.add("node_modules");
      }
      // If the parent directory is excluded, we are done.
      // "It is not possible to re-include a file if a parent directory of that file is excluded. Git doesn’t list excluded directories for performance reasons, so any patterns on contained files have no effect, no matter where they are defined."
      // source: https://git-scm.com/docs/gitignore
      const parentdir = path.dirname(filepath);
      if (parentdir !== "." && ign.ignores(parentdir)) {
        return true;
      }
      // If the file is currently ignored, test for UNignoring.
      if (ignoredStatus) {
        ignoredStatus = !ign.test(filepath).unignored;
      } else {
        ignoredStatus = ign.test(filepath).ignored;
      }
    }
    return ignoredStatus;
  }
}

module.exports = RecursiveIgnorer;
