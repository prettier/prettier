// Trim `Tab(U+0009)` and `Space(U+0020)` at the end of line
function trim(out, CURSOR_PLACEHOLDER) {
  let trimCount = 0;
  let outIndex = out.length;
  const cursors = [];

  outer: while (outIndex--) {
    const last = out[outIndex];

    if (last === CURSOR_PLACEHOLDER) {
      cursors.push(CURSOR_PLACEHOLDER);
      continue;
    }

    /* c8 ignore next 3 */
    if (process.env.NODE_ENV !== "production" && typeof last !== "string") {
      throw new Error(`Unexpected value in trim: '${typeof last}'`);
    }

    // Not using a regexp here because regexps for trimming off trailing
    // characters are known to have performance issues.
    for (let charIndex = last.length - 1; charIndex >= 0; charIndex--) {
      const char = last[charIndex];
      if (char === " " || char === "\t") {
        trimCount++;
      } else {
        out[outIndex] = last.slice(0, charIndex + 1);
        out.length = outIndex + 1;
        out.push(...cursors);
        break outer;
      }
    }
  }

  return trimCount;
}

export { trim };
