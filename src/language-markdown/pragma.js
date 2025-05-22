import parseFrontMatter from "../utils/front-matter/parse.js";
import {
  FORMAT_IGNORE_PRAGMAS,
  FORMAT_PRAGMA_TO_INSERT,
  FORMAT_PRAGMAS,
} from "../utils/pragma/pragma.evaluate.js";

function startWithPragma(text, pragmas) {
  const pragma = `@(${pragmas.join("|")})`;
  const regex = new RegExp(
    [
      `<!--\\s*${pragma}\\s*-->`,
      `\\{\\s*\\/\\*\\s*${pragma}\\s*\\*\\/\\s*\\}`,
      `<!--.*\r?\n[\\s\\S]*(^|\n)[^\\S\n]*${pragma}[^\\S\n]*($|\n)[\\s\\S]*\n.*-->`,
    ].join("|"),
    "mu",
  );
  const matched = text.match(regex);
  return matched?.index === 0;
}

const hasPragma = (text) =>
  startWithPragma(parseFrontMatter(text).content.trimStart(), FORMAT_PRAGMAS);

const hasIgnorePragma = (text) =>
  startWithPragma(
    parseFrontMatter(text).content.trimStart(),
    FORMAT_IGNORE_PRAGMAS,
  );

const insertPragma = (text) => {
  const extracted = parseFrontMatter(text);
  const pragma = `<!-- @${FORMAT_PRAGMA_TO_INSERT} -->`;
  return extracted.frontMatter
    ? `${extracted.frontMatter.raw}\n\n${pragma}\n\n${extracted.content}`
    : `${pragma}\n\n${extracted.content}`;
};

export { hasIgnorePragma, hasPragma, insertPragma, startWithPragma };
