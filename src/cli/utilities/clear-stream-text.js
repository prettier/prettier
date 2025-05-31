import readline from "node:readline";
import stripAnsi from "strip-ansi";
import wcwidth from "wcwidth.js";

const countLines = (stream, text) => {
  const columns = stream.columns || 80;
  let lineCount = 0;
  for (const line of stripAnsi(text).split("\n")) {
    lineCount += Math.max(1, Math.ceil(wcwidth(line) / columns));
  }
  return lineCount;
};

function clearStreamText(stream, text) {
  const lineCount = countLines(stream, text);

  for (let line = 0; line < lineCount; line++) {
    /* c8 ignore next 3 */
    if (line > 0) {
      readline.moveCursor(stream, 0, -1);
    }

    readline.clearLine(stream, 0);
    readline.cursorTo(stream, 0);
  }
}

export default clearStreamText;
