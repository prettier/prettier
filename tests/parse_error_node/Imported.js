/**
 * Parse errors, imported, not in flow, no provides module.
 * No parse errors are raised because it is ignored by flow.
 */
function f(s) { ### // illegal token
  return s;
}

module.exports = { f: f }
