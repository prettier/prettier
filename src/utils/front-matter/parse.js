const DELIMITER_LENGTH = 3;

/**
@typedef {{index: number, line: number, column: number}} Position
@typedef {{
  type: "front-matter",
  language: string,
  explicitLanguage: string | null,
  value: string,
  startDelimiter: string,
  endDelimiter: string,
  raw: string,
  start: Position,
  end: Position,
}} FrontMatter
*/

/**
@param {string} text
@returns {FrontMatter | undefined}
*/
function getFrontMatter(text) {
  const startDelimiter = text.slice(0, DELIMITER_LENGTH);

  if (startDelimiter !== "---" && startDelimiter !== "+++") {
    return;
  }

  const firstLineBreakIndex = text.indexOf("\n", DELIMITER_LENGTH);
  if (firstLineBreakIndex === -1) {
    return;
  }

  const explicitLanguage = text
    .slice(DELIMITER_LENGTH, firstLineBreakIndex)
    .trim();

  let endDelimiterIndex = text.indexOf(
    `\n${startDelimiter}`,
    firstLineBreakIndex,
  );

  let language = explicitLanguage;
  if (!language) {
    language = startDelimiter === "+++" ? "toml" : "yaml";
  }

  if (
    endDelimiterIndex === -1 &&
    startDelimiter === "---" &&
    language === "yaml"
  ) {
    // In some markdown processors such as pandoc,
    // "..." can be used as the end delimiter for YAML front-matter.
    endDelimiterIndex = text.indexOf("\n...", firstLineBreakIndex);
  }

  if (endDelimiterIndex === -1) {
    return;
  }

  const frontMatterEndIndex = endDelimiterIndex + 1 + DELIMITER_LENGTH;

  const nextCharacter = text.charAt(frontMatterEndIndex + 1);
  if (!/\s?/u.test(nextCharacter)) {
    return;
  }

  const raw = text.slice(0, frontMatterEndIndex);
  /** @type {string[]} */
  let lines;

  return {
    type: "front-matter",
    language,
    explicitLanguage: explicitLanguage || null,
    value: text.slice(firstLineBreakIndex + 1, endDelimiterIndex),
    startDelimiter,
    endDelimiter: raw.slice(-DELIMITER_LENGTH),
    raw,
    start: { line: 1, column: 0, index: 0 },
    end: {
      index: raw.length,
      get line() {
        lines ??= raw.split("\n");
        return lines.length;
      },
      get column() {
        lines ??= raw.split("\n");
        return lines.at(-1).length;
      },
    },
  };
}

function parse(text) {
  const frontMatter = getFrontMatter(text);

  if (!frontMatter) {
    return { content: text };
  }

  return {
    frontMatter,
    get content() {
      const { raw } = frontMatter;
      return raw.replaceAll(/[^\n]/gu, " ") + text.slice(raw.length);
    },
  };
}

export default parse;
