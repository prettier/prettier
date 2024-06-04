const frontMatterRegex = new RegExp(
  String.raw`^(?<startDelimiter>-{3}|\+{3})` +
    // trailing spaces after delimiters are allowed
    String.raw`(?<explicitLanguage>[^\n]*)` +
    String.raw`\n(?:|(?<value>.*?)\n)` +
    // In some markdown processors such as pandoc,
    // "..." can be used as the end delimiter for YAML front-matter.
    // Adding `\.{3}` make the regex matches `+++\n...`, but we'll exclude it later
    String.raw`(?<endDelimiter>\k<startDelimiter>|\.{3})` +
    String.raw`[^\S\n]*(?:\n|$)`,
  "s",
);

function parse(text) {
  const match = text.match(frontMatterRegex);
  if (!match) {
    return { content: text };
  }

  let {
    startDelimiter,
    explicitLanguage,
    value = "",
    endDelimiter,
  } = match.groups;

  explicitLanguage = explicitLanguage.trim();

  let language = explicitLanguage || "yaml";
  if (startDelimiter === "+++") {
    language = "toml";
  }

  // Only allow yaml to parse with a different end delimiter
  if (language !== "yaml" && startDelimiter !== endDelimiter) {
    return { content: text };
  }

  const [raw] = match;
  const frontMatter = {
    type: "front-matter",
    language,
    explicitLanguage: explicitLanguage || undefined,
    value,
    startDelimiter,
    endDelimiter,
    raw: raw.replace(/\n$/, ""),
  };

  return {
    frontMatter,
    content: raw.replaceAll(/[^\n]/g, " ") + text.slice(raw.length),
  };
}

export default parse;
