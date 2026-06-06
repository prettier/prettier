import { massageAstNode } from "../../src/language-yaml/massage-ast/index.js";

test.each([
  ["blockLiteral", "clip"],
  ["blockLiteral", "strip"],
  ["blockFolded", "clip"],
  ["blockFolded", "strip"],
])("%s with %s chomping preserves value", (type, chomping) => {
  const original = {
    type,
    chomping,
    value: "line\n\n",
  };
  const cloned = { ...original };

  massageAstNode(original, cloned);

  expect(cloned.value).toBe(original.value);
});

test.each(["blockLiteral", "blockFolded"])(
  "%s with keep chomping still ignores trailing line whitespace",
  (type) => {
    const original = {
      type,
      chomping: "keep",
      value: "line  \nnext\t\n",
    };
    const cloned = { ...original };

    massageAstNode(original, cloned);

    expect(cloned.value).toBe("line\nnext\n");
  },
);
