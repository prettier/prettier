// Simple version of `find-project-root`
// https://github.com/kirstein/find-project-root/blob/master/index.js

import fs from "node:fs";
import path from "node:path";

const MARKERS = [".git", ".hg"];

const markerExists = (directory) =>
  MARKERS.some((mark) => fs.existsSync(path.join(directory, mark)));

function findProjectRoot(directory) {
  while (!markerExists(directory)) {
    const parentDirectory = path.resolve(directory, "..");
    if (parentDirectory === directory) {
      break;
    }
    directory = parentDirectory;
  }

  return directory;
}

export default findProjectRoot;
