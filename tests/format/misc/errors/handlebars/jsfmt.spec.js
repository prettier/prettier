run_spec(
  {
    dirname: __dirname,
    snippets: [
      ...[
        "area",
        "base",
        // "basefont",
        // "bgsound",
        "br",
        "col",
        "command",
        "embed",
        // "frame",
        "hr",
        // "image",
        "img",
        "input",
        // "isindex",
        "keygen",
        "link",
        // "menuitem",
        "meta",
        // "nextid",
        "param",
        "source",
        "track",
        "wbr",
      ].map((tag) => ({ name: tag, code: `<${tag}></${tag}>` })),
      ...[
        "div",
        // Missed HTML void tags
        "basefont",
        "bgsound",
        "frame",
        "image",
        "isindex",
        "menuitem",
        "nextid",
      ].map((tag) => ({ name: tag, code: `<${tag}>` })),
    ],
  },
  ["glimmer"]
);
