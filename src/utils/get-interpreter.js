import fs from "node:fs";
import readlines from "n-readlines";

/**
 * @param {string | URL} file
 * @returns {string | undefined}
 */
function getInterpreter(file) {
  let fd;
  try {
    fd = fs.openSync(file, "r");
  } catch {
    /* c8 ignore next */
    return;
  }

  try {
    const liner = new readlines(fd);
    const firstLine = liner.next().toString("utf8");

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
  } finally {
    try {
      // There are some weird cases where paths are missing, causing Jest
      // failures. It's unclear what these correspond to in the real world.
      fs.closeSync(fd);
    } catch {
      // noop
    }
  }
}

export default getInterpreter;
