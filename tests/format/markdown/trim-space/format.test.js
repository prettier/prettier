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

\u00a0\u00a0NBSP\u00a0\u00a0

\u2002\u2002en space\u2002\u2002

\u2003\u2003em space\u2003\u2003

\u2004\u20041/3em\u2004\u2004

\u2005\u20051/4em\u2005\u2005

\u2028\u2028line separator\u2028\u2028

\u2029\u2029paragraph separator\u2029\u2029

\u3000\u3000全角空白\u3000\u3000

\ufeff\ufeffzero width NBSP\ufeff\ufeff
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
