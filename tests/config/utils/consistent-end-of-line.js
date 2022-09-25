function consistentEndOfLine(text) {
  let firstEndOfLine;
  return text.replace(/\r\n?|\n/g, (endOfLine) => {
    firstEndOfLine ??= endOfLine;
    return firstEndOfLine;
  });
}

export default consistentEndOfLine;
