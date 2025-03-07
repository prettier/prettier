function leadingTestCase() {
  const paragraphs = Array.from(
    { length: 3 },
    (_, i) => " ".repeat(i + 1) + "This is not a code block.\n",
  );
  return {
    name: "Trim leading U+0020 less than 4",
    code: paragraphs.join("\n"),
    output: paragraphs.map((p) => p.replace(/^ +/u, "")).join("\n"),
  };
}

function trailingTestCase() {
  const line = "The trailing space not producing hard break should be removed.";
  // trailing tab is not treated as 4 spaces because trailing spaces don't
  // define block structure. (https://spec.commonmark.org/0.30/#tabs)
  // 2 or more spaces are treated as hard line break.
  const spaces = [" ", "\t", "\t\t", "\t \t "];
  return {
    name: "Trim trailing U+0020 or tab that don't produce hard break",
    code: spaces.map((sp) => line + sp + "\n").join("\n"),
    output: spaces.map(() => line + "\n").join("\n"),
  };
}

function preserveVariantSpacesTestCase() {
  const variantSpaces = `\v\vvertical tab\v\v

\u{a0}\u{a0}NBSP\u{a0}\u{a0}

\u{2002}\u{2002}en space\u{2002}\u{2002}

\u{2003}\u{2003}em space\u{2003}\u{2003}

\u{2004}\u{2004}1/3em\u{2004}\u{2004}

\u{2005}\u{2005}1/4em\u{2005}\u{2005}

\u{2028}\u{2028}line separator\u{2028}\u{2028}

\u{2029}\u{2029}paragraph separator\u{2029}\u{2029}

\u{3000}\u{3000}全角空白\u{3000}\u{3000}

\u{feff}\u{feff}zero width NBSP\u{feff}\u{feff}
`;
  return {
    name: "Preserve non-ASCII Unicode spaces / line terminators, and vertical tab",
    code: variantSpaces,
    output: variantSpaces,
  };
}

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      leadingTestCase(),
      trailingTestCase(),
      preserveVariantSpacesTestCase(),
    ],
  },
  ["markdown"],
  {
    proseWrap: "always",
  },
);
