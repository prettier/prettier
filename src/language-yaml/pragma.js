function isPragma(text) {
  return /^\s*@(?:prettier|format)\s*$/.test(text);
}

function hasPragma(text) {
  return /^\s*#[^\S\n]*@(?:prettier|format)\s*?(?:\n|$)/.test(text);
}

function insertPragma(text) {
  return `# @format\n\n${text}`;
}

export { hasPragma, insertPragma,isPragma };
