"use strict";

const fs = require("fs");
const readlines = require("n-readlines");

function getInterpreter(filepath) {
  /* istanbul ignore next */
  if (typeof filepath !== "string") {
    return "";
  }

  let fd;
  try {
    fd = fs.openSync(filepath, "r");
  } catch {
    // istanbul ignore next
    return "";
  }

  try {
    const liner = new readlines(fd);
    const firstLine = liner.next().toString("utf8");

    // #!/bin/env node, #!/usr/bin/env node
    const m1 = firstLine.match(/^#!\/(?:usr\/)?bin\/env\s+(\S+)/);
    if (m1) {
      return m1[1];
    }

    // #!/bin/node, #!/usr/bin/node, #!/usr/local/bin/node
    const m2 = firstLine.match(/^#!\/(?:usr\/(?:local\/)?)?bin\/(\S+)/);
    if (m2) {
      return m2[1];
    }
    return "";
  } catch {
    // There are some weird cases where paths are missing, causing Jest
    // failures. It's unclear what these correspond to in the real world.
    /* istanbul ignore next */
    return "";
  } finally {
    try {
      // There are some weird cases where paths are missing, causing Jest
      // failures. It's unclear what these correspond to in the real world.
      fs.closeSync(fd);
    } catch {
      // nop
    }
  }
}

module.exports = getInterpreter;
