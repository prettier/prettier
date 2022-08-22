import {
  hasPragma as jsHasPragma,
  insertPragma as jsInsertPragma,
} from "../language-js/pragma.js";
import { parseFrontMatter } from "../utils/index.js";

function hasPragma(text) {
  return jsHasPragma(parseFrontMatter(text).content);
}

function insertPragma(text) {
  const { frontMatter, content } = parseFrontMatter(text);
  return (
    (frontMatter ? frontMatter.raw + "\n\n" : "") + jsInsertPragma(content)
  );
}

export { hasPragma, insertPragma };
