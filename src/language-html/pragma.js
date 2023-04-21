function hasPragma(text) {
  return /^\s*<!--\s*@(?:format|prettier)\s*-->/.test(text);
}

function insertPragma(text) {
  return "<!-- @format -->\n\n" + text;
}

export { hasPragma, insertPragma };
