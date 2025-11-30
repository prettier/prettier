function consistentEndOfLine(text) {
  let firstEndOfLine;
  return text.replace(/\r\n?|\n/gu, (endOfLine) => {
    firstEndOfLine = firstEndOfLine ?? endOfLine;
    return firstEndOfLine;
  });
}

export default consistentEndOfLine;
