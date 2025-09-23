import parseFrontMatter from "../utils/front-matter/parse.js";
import {
  FORMAT_PRAGMA_TO_INSERT,
  MARKDOWN_HAS_IGNORE_PRAGMA_REGEXP,
  MARKDOWN_HAS_PRAGMA_REGEXP,
} from "../utils/pragma/pragma.evaluate.js";

const hasPragma = (text) =>
  MARKDOWN_HAS_PRAGMA_REGEXP.match(parseFrontMatter(text).content.trimStart())
    ?.index === 0;

const hasIgnorePragma = (text) =>
  MARKDOWN_HAS_IGNORE_PRAGMA_REGEXP.match(
    parseFrontMatter(text).content.trimStart(),
  )?.index === 0;

const insertPragma = (text) => {
  const { frontMatter } = parseFrontMatter(text);
  const pragma = `<!-- @${FORMAT_PRAGMA_TO_INSERT} -->`;
  return frontMatter
    ? `${frontMatter.raw}\n\n${pragma}\n\n${text.slice(frontMatter.end.index)}`
    : `${pragma}\n\n${text}`;
};

export { hasIgnorePragma, hasPragma, insertPragma };
