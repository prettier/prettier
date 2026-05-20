import getVisitorKeys from "../../src/language-css/get-visitor-keys.js";
import { parsers } from "../../src/language-css/index.js";
import { getDescendants } from "../../src/utilities/ast.js";

const languages = {
  css: [
    ".blah {\n  /* hloow  */\n  background-color: white;\n}",
    "@media screen and (max-width: 30em) { a { color: red; } }",
    "@supports selector(:not(.a,.b)) {}",
    "@supports selector() {}",
    "@utility aspect-* { aspect-ratio: --value(--aspect-ratio-*, ratio, [ratio]); }",
    "* html p {font-size: 5em; }\n.class {\n*zoom: 1;_width: 200px;\n+color:red;\ncolor:red\\9;\n}",
    ":root {\n  --l: , #000;\n}",
  ],
  scss: [
    "@mixin placeholder {\n  &::placeholder {@content}\n}",
    "@mixin margin-bottom-1\\/3 {\n  margin-bottom: 0.8rem;\n}\nlabel {\n  @include margin-bottom-1\\/3;\n}",
    ".something {\n  grid-template-columns: 1 2fr (3 + 4);\n}",
    '@warn "Warn (#{$message}).";\n@error #{$message};',
  ],
  less: [".mixin() {\n  color: red;\n}\n.a {\n  .mixin();\n}"],
};

test.each(
  Object.entries(languages).flatMap(([parser, texts]) =>
    texts.map((text) => ({ parser, text })),
  ),
)("CSS AST nodes have locations: $parser", ({ parser, text }) => {
  const ast = parsers[parser].parse(text, { parser, originalText: text });

  for (const node of [ast, ...getDescendants(ast, { getVisitorKeys })]) {
    expect(node.source).toMatchObject({
      startOffset: expect.any(Number),
      endOffset: expect.any(Number),
    });
    expect(node.source.startOffset).toBeGreaterThanOrEqual(0);
    expect(node.source.endOffset).toBeLessThanOrEqual(text.length);
    expect(node.source.startOffset).toBeLessThanOrEqual(node.source.endOffset);
  }
});
