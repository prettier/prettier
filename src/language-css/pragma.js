
import jsPragma from "../language-js/pragma.js";
import parseFrontMatter from "../utils/front-matter/parse.js";

function hasPragma(text) {
  return jsPragma.hasPragma(parseFrontMatter(text).content);
}

function insertPragma(text) {
  const { frontMatter, content } = parseFrontMatter(text);
  return (
    (frontMatter ? frontMatter.raw + "\n\n" : "") +
    jsPragma.insertPragma(content)
  );
}

export  {
  hasPragma,
  insertPragma,
};
