const snippets = [
  "export default (a++);",
  "export default (a++).toString();",
  "export default (a++)?.toString();",

  "export default (++ a);",
  "export default (++ a).toString();",
  "export default (++ a)?.toString();",

  "export default (+a);",
  "export default (+a)?.toString();",

  "export default (function this_is_a_expression_not_a_declaration() {});",
  "export default (function this_is_a_expression_not_a_declaration() {}).toString();",

  "export default (class this_is_a_expression_not_a_declaration {});",
  "export default (class this_is_a_expression_not_a_declaration {}).toString();",
  "export default (class this_is_a_expression_not_a_declaration {})?.toString();",

  "export default (a in b);",
  "export default (a in b).toString();",
  "export default (a in b)?.toString();",

  "export default (a || b);",
  "export default (a || b).toString();",
  "export default (a || b)?.toString();",

  "export default (a , b);",
  "export default (a , b)?.toString();",

  "export default (1.);",
  "export default (1.).toString();",
  "export default (1.)?.toString();",

  "export default (a = b);",
  "export default (a = b).toString();",
  "export default (a = b)?.toString();",

  "export default (a += b);",
  "export default (a += b).toString();",
  "export default (a += b)?.toString();",

  "export default (a ? b : c);",
  "export default (a ? b : c).toString();",
  "export default (a ? b : c)?.toString();",

  "export default (() =>{});",
  "export default (() =>{}).toString();",
  "export default (() =>{})?.toString();",

  "export default (a``);",
  "export default (a``).toString();",
  "export default (a``)?.toString();",

  "export default (<a></a>);",
  "export default (<a></a>).toString();",
  "export default (<a></a>)?.toString();",
];

runFormatTest(
  {
    snippets,
    importMeta: import.meta,
  },
  ["babel", "flow", "typescript"],
);

const snippetsWithTla = [
  "export default (await a);",
  "export default (await a).toString();",
  "export default (await a)?.toString();",
];

runFormatTest(
  {
    snippets: snippetsWithTla,
    importMeta: import.meta,
  },
  [
    "babel",
    // TODO: enable when it supports TLA
    // "flow",
    "typescript",
  ],
);
