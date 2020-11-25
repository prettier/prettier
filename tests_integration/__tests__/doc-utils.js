"use strict";

const prettier = require("prettier-local");
const { ifBreak } = prettier.doc.builders;
const { mapDoc, traverseDoc } = prettier.doc.utils;

describe("mapDoc", () => {
  test("Should not receive root array", () => {
    const result = [];
    mapDoc(["foo"], (doc) => {
      result.push(doc);
      return doc;
    });
    expect(result).toStrictEqual(["foo", { type: "concat", parts: ["foo"] }]);
  });
  test("Should not receive child array", () => {
    const result = [];
    mapDoc(ifBreak(["foo"]), (doc) => {
      result.push(doc);
      return doc;
    });
    expect(result).toStrictEqual([
      "foo",
      { type: "concat", parts: ["foo"] },
      {
        type: "if-break",
        breakContents: { type: "concat", parts: ["foo"] },
        flatContents: undefined,
        groupId: undefined,
      },
    ]);
  });
});

describe("traverseDoc", () => {
  test("Should not receive root array", () => {
    const result = [];
    traverseDoc(["foo"], (doc) => {
      result.push(doc);
      return doc;
    });
    expect(result).toStrictEqual([{ type: "concat", parts: ["foo"] }, "foo"]);
  });
  test("Should not receive child array", () => {
    const result = [];
    mapDoc(ifBreak(["foo"]), (doc) => {
      result.push(doc);
      return doc;
    });
    expect(result).toStrictEqual([
      {
        type: "if-break",
        breakContents: { type: "concat", parts: ["foo"] },
        flatContents: undefined,
        groupId: undefined,
      },
      { type: "concat", parts: ["foo"] },
      "foo",
    ]);
  });
});
