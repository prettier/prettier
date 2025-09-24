import {
  hasIgnorePragma as jsHasIgnorePragma,
  hasPragma as jsHasPragma,
  insertPragma as jsInsertPragma,
} from "../language-js/pragma.js";
import { parseFrontMatter } from "../utils/front-matter/index.js";

const hasPragma = (text) => jsHasPragma(parseFrontMatter(text).content);
const hasIgnorePragma = (text) =>
  jsHasIgnorePragma(parseFrontMatter(text).content);
const insertPragma = (text) => {
  const { frontMatter, content } = parseFrontMatter(text);
  return (
    (frontMatter ? frontMatter.raw + "\n\n" : "") + jsInsertPragma(content)
  );
};

export { hasIgnorePragma, hasPragma, insertPragma };
