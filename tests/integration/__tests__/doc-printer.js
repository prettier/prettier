"use strict";

const prettier = require("prettier-local");
const { group, ifBreak } = prettier.doc.builders;
const { printDocToString } = prettier.doc.printer;
const docToString = (doc, options) =>
  printDocToString(doc, { tabSize: 2, ...options }).formatted;

// Extra group should not effect `ifBreak` inside
test("`ifBreak` inside `group`", () => {
  const groupId = Symbol("test-group-id");
  const FLAT_TEXT = "flat";
  const doc = group(ifBreak("break", FLAT_TEXT, { groupId }), {
    id: groupId,
  });
  const docs = [
    doc,
    [group(""), doc],
    [doc, group("")],
    group(doc),
    group(doc, { id: Symbol("wrapper-group-id") }),
  ];

  expect(
    docs.map((doc) => docToString(doc, { printWidth: FLAT_TEXT.length }))
  ).toStrictEqual(Array.from({ length: docs.length }, () => FLAT_TEXT));
});
