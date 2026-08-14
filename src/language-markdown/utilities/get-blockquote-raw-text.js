function countRawLeadingBlockquoteMarkers(text) {
  const [prefix] = text.match(
    /^[ \t]*(?:(?:>|\\>|&gt;|&GT;|&#0*62;|&#[xX]0*3[eE];)[ \t]*)*/,
  );
  return prefix.match(/>|\\>|&gt;|&GT;|&#0*62;|&#[xX]0*3[eE];/g)?.length ?? 0;
}

function countValueLeadingBlockquoteMarkers(text) {
  const [prefix] = text.match(/^[ \t]*(?:>[ \t]*)*/);
  return prefix.match(/>/g)?.length ?? 0;
}

function getBlockquoteRawText(text, node) {
  const newLineRegexp = /(?<!\\)(?:\\\\)*(?:&NewLine;|&#0*10;|&#[Xx]0*[Aa];)/g;
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
    const rawMarkerCount = countRawLeadingBlockquoteMarkers(rawLine);
    const valueMarkerCount = countValueLeadingBlockquoteMarkers(valueLine);
    const matchesToBeRemoved = rawMarkerCount - valueMarkerCount;
    if (matchesToBeRemoved <= 0) {
      return rawLine;
    }
    return rawLine.replace(
      new RegExp(
        String.raw`^[ \t]*(?:(?:>|\\>|&gt;|&GT;|&#0*62;|&#[xX]0*3[eE];)[ \t]*){${matchesToBeRemoved}}`,
      ),
      "",
    );
  });
  return resultLines.join("\n");
}

export { getBlockquoteRawText };
