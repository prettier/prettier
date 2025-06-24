import readlines from "n-readlines";

/**
 * @param {string | URL} file
 * @returns {string | undefined}
 */
function getInterpreter(file) {
  try {
    const liner = new readlines(file);
    const firstLineBuffer = liner.next();

    if (firstLineBuffer === false) {
      return;
    }

    liner.close();

    const firstLine = firstLineBuffer.toString("utf8");

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
  } catch {
    // couldn't open the file
  }
}

export default getInterpreter;
