function consistentEndOfLine(text) {
  let firstEndOfLine;
  return text.replace(/\r\n?|\n/g, (endOfLine) => {
    if (!firstEndOfLine) {
      firstEndOfLine = endOfLine;
    }
    return firstEndOfLine;
  });
}

export default consistentEndOfLine;
