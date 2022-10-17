#!/usr/bin/env node

import fs from "node:fs/promises";
// https://github.com/commonmark/commonmark-spec/blob/ea177af1066ef0eefcf2ffebc23f8bf968b69f67/test/spec_tests.py#L105
const EXAMPLE_BLOCK_MARK = "`".repeat(32);
// https://github.com/commonmark/commonmark-spec/blob/ea177af1066ef0eefcf2ffebc23f8bf968b69f67/test/spec_tests.py#L121
const CODE_SEPARATOR = ".";
const SPEC_TEXT_URL =
  "https://raw.githubusercontent.com/commonmark/commonmark-spec/HEAD/spec.txt";
const TEST_DIRECTORY = new URL(
  "../tests/format/markdown/spec/",
  import.meta.url
);
const EXAMPLE_REGEXP = new RegExp(
  [
    "",
    `${EXAMPLE_BLOCK_MARK} example`,
    "(?<markdownCode>.*?)",
    `\\${CODE_SEPARATOR}`,
    "(?<htmlCode>.*?)",
    EXAMPLE_BLOCK_MARK,
    "",
  ].join("\\n"),
  "gsu"
);

const response = await fetch(SPEC_TEXT_URL);
const text = await response.text();
const { specVersion } = text.match(
  /(?<=\nversion: ')(?<specVersion>[\d.]+)(?='\n)/
).groups;

const examples = [...text.matchAll(EXAMPLE_REGEXP)].map((match, index) => ({
  filename: `commonmark-${specVersion}-example-${index + 1}.md`,
  code: match.groups.markdownCode.replaceAll("→", "\t"),
}));

await Promise.all(
  (await fs.readdir(TEST_DIRECTORY))
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => fs.rm(new URL(filename, TEST_DIRECTORY)))
);

await Promise.all(
  examples.map(({ filename, code }) =>
    fs.writeFile(new URL(filename, TEST_DIRECTORY), `${code}\n`)
  )
);
