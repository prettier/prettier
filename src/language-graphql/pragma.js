function hasPragma(text) {
  return /^\s*#[^\S\n]*@(?:format|prettier)\s*(?:\n|$)/u.test(text);
}

function insertPragma(text) {
  return "# @format\n\n" + text;
}

export { hasPragma, insertPragma };
