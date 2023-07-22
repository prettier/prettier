function leadingTestCase() {
  const paragraphs = Array.from(
    { length: 3 },
    (_, i) => " ".repeat(i + 1) + "This is not a code block.\n",
  );
  return {
    name: "Trim leading U+0020 less than 4",
    code: paragraphs.join("\n"),
    output: paragraphs.map((p) => p.replace(/^ +/, "")).join("\n"),
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

run_spec(
  {
    importMeta: import.meta,
    snippets: [leadingTestCase(), trailingTestCase()],
  },
  ["markdown"],
  {
    proseWrap: "always",
  },
);
