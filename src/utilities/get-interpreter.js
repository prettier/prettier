import readlines from "n-readlines";
import { toPath } from "url-or-path";

/**
 * @param {string | URL} file
 * @returns {string | undefined}
 */
function readFileFirstLine(file) {
  const liner = new readlines(toPath(file));
  const firstLineBuffer = liner.next();

  if (typeof liner.fd === "number") {
    liner.close();
  }

  return firstLineBuffer?.toString("utf8");
}

/**
 * @param {string | URL} file
 * @returns {string | undefined}
 */
function getInterpreter(file) {
  let firstLine;
  try {
    firstLine = readFileFirstLine(file);
  } catch {
    // couldn't open the file
  }

  if (!firstLine) {
    return;
  }

  // #!/bin/env node, #!/usr/bin/env node
  const m1 = firstLine.match(/^#!\/(?:usr\/)?bin\/env\s+(\S+)/u);
  if (m1) {
    return m1[1];
  }

  // #!/bin/node, #!/usr/bin/node, #!/usr/local/bin/node
  const m2 = firstLine.match(/^#!\/(?:usr\/(?:local\/)?)?bin\/(\S+)/u);
  if (m2) {
    return m2[1];
  }
}

export default getInterpreter;
