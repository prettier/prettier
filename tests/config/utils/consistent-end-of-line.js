function consistentEndOfLine(text) {
  let firstEndOfLine;
  return text.replaceAll(/\r\n?|\n/gu, (endOfLine) => {
    firstEndOfLine ??= endOfLine;
    return firstEndOfLine;
  });
}

export default consistentEndOfLine;
