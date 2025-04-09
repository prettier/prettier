function visualizeEndOfLine(text) {
  return text.replace(/\r\n?|\n/gu, (endOfLine) => {
    switch (endOfLine) {
      case "\n":
        return "<LF>\n";
      case "\r\n":
        return "<CRLF>\n";
      case "\r":
        return "<CR>\n";
      default:
        throw new Error(`Unexpected end of line ${JSON.stringify(endOfLine)}`);
    }
  });
}

export default visualizeEndOfLine;
