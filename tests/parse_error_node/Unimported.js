/**
 * Parse errors but not in flow and not imported.
 * Should see no parse errors for this file.
 * @providesModule Bar
 */
function f(s:string):string { ### // illegal token
  return s;
}

module.exports = { f: f }
