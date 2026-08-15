/**
 * @param line {string}
 * @returns {number}
 */
function countValueLeadingGreaterThan(line) {
  const [leadingGreaterThanPart] = line.match(/^[ \t]*(?:>[ \t]*)*/);
  return leadingGreaterThanPart
    .split("")
    .filter((character) => character === ">").length;
}

/**
 * @param line {string}
 * @param greaterThanToKeep {number}
 * @returns {string}
 */
function removeBlockquoteMarkers(line, greaterThanToKeep) {
  const rawBlockquoteRegexp =
    /[ \t]*(?:>|\\>|&gt;|&GT;|&#0*62;|&#[xX]0*3[eE];)[ \t]*/y;
  /** @type {Array<number>} */
  const greaterThanIndexes = [];
  let { lastIndex } = rawBlockquoteRegexp;

  let match;
  while ((match = rawBlockquoteRegexp.exec(line))) {
    greaterThanIndexes.push(match.index);
    lastIndex = rawBlockquoteRegexp.lastIndex;
  }

  if (greaterThanToKeep === 0) {
    return line.slice(lastIndex);
  }
  const firstGreaterThanToKeep = greaterThanIndexes.at(-greaterThanToKeep);
  if (firstGreaterThanToKeep === null) {
    return line;
  }
  return line.slice(firstGreaterThanToKeep);
}

const newLineRegexp = /(?<!\\)(?:\\\\)*(?:&NewLine;|&#0*10;|&#[Xx]0*[Aa];)/g;
function getBlockquoteRawText(text, node) {
  const rawLines = text.split("\n");
  const valueLines = node.value.split("\n");
  let valueIndex = 0;
  const resultLines = rawLines.map((rawLine, index) => {
    const valueLine = valueLines[valueIndex++];
    const decodedNewlines = rawLine.matchAll(newLineRegexp);
    valueIndex += [...decodedNewlines].length;

    if (index === 0) {
      return rawLine;
    }
    const valueMarkerCount = countValueLeadingGreaterThan(valueLine);
    return removeBlockquoteMarkers(rawLine, valueMarkerCount);
  });
  return resultLines.join("\n");
}

export { getBlockquoteRawText };
