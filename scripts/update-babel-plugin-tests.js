#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import dashify from "dashify";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm as gfmSyntax } from "micromark-extension-gfm";
import { outdent } from "outdent";

const testDirectory = new URL(
  "../tests/format/js/babel-plugins/",
  import.meta.url,
);
const docUrl =
  "https://raw.githubusercontent.com/babel/website/HEAD/docs/parser.md";
const cacheFile = new URL("../.tmp/babel-parser-plugins.md", import.meta.url);

async function getDoc() {
  let stat;

  try {
    stat = await fs.stat(cacheFile);
  } catch {
    // No op
  }

  if (stat) {
    if (Date.now() - stat.mtimeMs < /* 60 minutes */ 60 * 60 * 1000) {
      return fs.readFile(cacheFile, "utf8");
    }

    await fs.rm(cacheFile);
  }

  const response = await fetch(docUrl);

  if (!response.ok) {
    throw new Error(`Fetch '${docUrl}' failed.`);
  }

  const text = await response.text();

  await fs.writeFile(cacheFile, text);

  return text;
}

function* parseCodeExample(nodes) {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.type === "inlineCode") {
      yield node.value;
    } else if (node.type === "html" && node.value === "<code>") {
      const valueNode = nodes[++index];
      const closingTagNode = nodes[++index];
      assert.equal(closingTagNode.type, "html");
      assert.equal(closingTagNode.value, "</code>");

      assert.equal(valueNode.type, "text");
      yield valueNode.value;
    } else {
      assert.equal(node.type, "text");
      assert.equal(node.value.trim(), ",");
    }
  }
}

function* parsePluginTable(text) {
  const tree = fromMarkdown(text, {
    extensions: [gfmSyntax()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  assert.equal(tree.children.length, 1);
  assert.equal(tree.children[0].type, "table");

  const table = tree.children[0];

  assert.ok(table.children.length > 2);

  for (const row of table.children.slice(1)) {
    const [nameCell, exampleCell] = row.children;

    assert.equal(nameCell.children[0].type, "inlineCode");
    const name = nameCell.children[0].value;
    assert.ok(/^[a-z\d]+$/i.test(name), name);

    const comment = text
      .slice(nameCell.position.start.offset + 1, nameCell.position.end.offset)
      .trim();

    yield {
      name,
      comment,
      examples: parseCodeExample(exampleCell.children).toArray(),
    };
  }
}

async function clean() {
  const files = await fs.readdir(testDirectory);

  await Promise.all(
    files
      .filter(
        (file) => !(file === "format.test.js" || file === "__snapshots__"),
      )
      .map((file) => fs.rm(new URL(file, testDirectory))),
  );
}

function* getExamples(text) {
  const matches = text.matchAll(
    /(?<=\n)\| Name\s* \| Code Example \s* \|\n.*?(?=\n\n)/gs,
  );

  for (const [text] of matches) {
    for (const { name, comment, examples } of parsePluginTable(text)) {
      for (const [index, code] of examples.entries()) {
        const filename = `${dashify(name)}${index === 0 ? "" : `-${index + 1}`}.js`;
        yield { filename, name, comment, code };
      }
    }
  }
}

async function updateBabelPluginTests() {
  const text = await getDoc();

  await Promise.all(
    getExamples(text).map(({ filename, comment, code }) =>
      fs.writeFile(
        new URL(filename, testDirectory),
        outdent`
          /*
          ${comment}
          */

          ${code}
        ` + "\n",
      ),
    ),
  );
}

await clean();
await updateBabelPluginTests();
