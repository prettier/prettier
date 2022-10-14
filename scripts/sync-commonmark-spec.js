#!/usr/bin/env node

import fs from "node:fs/promises";
// https://github.com/commonmark/commonmark-spec/blob/ea177af1066ef0eefcf2ffebc23f8bf968b69f67/test/spec_tests.py#L105
const EXAMPLE_BLOCK_MARK = "`".repeat(32);
// https://github.com/commonmark/commonmark-spec/blob/ea177af1066ef0eefcf2ffebc23f8bf968b69f67/test/spec_tests.py#L121
const CODE_SEPERATOR = ".";
const SPEC_TEXT_URL =
  "https://raw.githubusercontent.com/commonmark/commonmark-spec/HEAD/spec.txt";
const FIXTURES = new URL(
  "../tests/format/markdown/spec/snippets.spec.json",
  import.meta.url
);
const EXAMPLE_REGEXP = new RegExp(
  [
    "",
    `${EXAMPLE_BLOCK_MARK} example`,
    "(?<markdownCode>.*?)",
    `\\${CODE_SEPERATOR}`,
    "(?<htmlCode>.*?)",
    EXAMPLE_BLOCK_MARK,
    "",
  ].join("\\n"),
  "gsu"
);

const response = await fetch(SPEC_TEXT_URL);
const text = await response.text();

const examples = [...text.matchAll(EXAMPLE_REGEXP)].map((match, index) => ({
  name: `example-${index + 1}.md`,
  code: match.groups.markdownCode.replaceAll("→", "\t"),
}));

await fs.writeFile(FIXTURES, JSON.stringify(examples, undefined, 2) + "\n");
