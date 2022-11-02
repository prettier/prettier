import fs from "node:fs";
import { promises as readlinePromises } from "node:readline";

async function readFirstLine(filepath) {
  const readline = readlinePromises.createInterface({
    input: fs.createReadStream(filepath),
    crlfDelay: Number.POSITIVE_INFINITY,
  });
  const { value: firstLine } = await readline[Symbol.asyncIterator]().next();

  return firstLine;
}

async function getInterpreter(filepath) {
  /* c8 ignore next 3 */
  if (typeof filepath !== "string") {
    return;
  }

  let firstLine;
  try {
    firstLine = await readFirstLine(filepath);
  } catch {
    // No op
  }

  if (!firstLine) {
    return;
  }

  const match =
    // #!/bin/env node, #!/usr/bin/env node
    firstLine.match(/^#!\/(?:usr\/)?bin\/env\s+(?<interpreter>\S+)/) ??
    // #!/bin/node, #!/usr/bin/node, #!/usr/local/bin/node
    firstLine.match(/^#!\/(?:usr\/(?:local\/)?)?bin\/(?<interpreter>\S+)/);

  return match?.groups.interpreter;
}

export default getInterpreter;
