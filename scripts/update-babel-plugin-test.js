#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import dashify from "dashify";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm as gfmSyntax } from "micromark-extension-gfm";

const directory = new URL("../tests/format/js/babel-plugins/", import.meta.url);

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

  for (const row of table.children.slice(2)) {
    const [nameCell, exampleCell] = row.children;

    assert.equal(nameCell.children[0].type, "inlineCode");
    const name = nameCell.children[0].value;

    if (
      // https://github.com/babel/website/pull/3244
      name === "deprecatedImportAssert" ||
      // FIXME[@fisker]
      name === "functionSent"
    ) {
      continue;
    }

    yield { name, examples: [...parseCodeExample(exampleCell.children)] };
  }
}

async function clean() {
  const files = await fs.readdir(directory);

  await Promise.all(
    files
      .filter(
        (file) => !(file === "format.test.js" || file === "__snapshots__"),
      )
      .map((file) => fs.rm(new URL(file, directory))),
  );
}

function* getExamples(text) {
  const matches = text.matchAll(
    /(?<=\n)\| Name\s* \| Code Example \s* \|\n.*?(?=\n\n)/gs,
  );

  for (const [text] of matches) {
    for (const { name, examples } of parsePluginTable(text)) {
      for (const [index, code] of examples.entries()) {
        const file = `${dashify(name)}${index === 0 ? "" : `-${index + 1}`}.js`;
        yield { file, name, code };
      }
    }
  }
}

async function updateBabelPluginTests() {
  // const response = await fetch(
  //   "https://raw.githubusercontent.com/babel/website/HEAD/docs/parser.md",
  // );
  // const text = await response.text();
  const text = await fs.readFile(
    new URL("./parser.md", import.meta.url),
    "utf8",
  );

  await Promise.all(
    getExamples(text).map(({ file, code }) =>
      fs.writeFile(new URL(file, directory), `${code}\n`),
    ),
  );
}

await clean();
await updateBabelPluginTests();
