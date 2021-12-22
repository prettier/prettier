const { outdent } = require("outdent");

run_spec(__dirname, ["glimmer"], {
  htmlWhitespaceSensitivity: "ignore",
  printWidth: 40,
});
run_spec(
  {
    dirname: __dirname,
    snippets: [
      // single
      // https://developer.mozilla.org/en-US/docs/Glossary/Whitespace#In_HTML
      ...["\u0009", "\u000C", "\u0020"].map((textContent) => ({
        code: `<div>${textContent}</div>`,
        name: "content",
        output: "<div> </div>",
      })),
      ...["\u000A", "\u000D"].map((textContent) => ({
        code: `<div>${textContent}</div>`,
        name: "content",
        output: "<div>\n</div>",
      })),

      // many
      {
        code: "<div>\u0009\u000A\u000C\u000D\u0020</div>",
        output: "<div>\n\n</div>",
      },

      // single
      ...["\u0009", "\u000C", "\u0020"].map((textContent) => ({
        code: `<img/>${textContent}<img/>`,
        name: "between",
        output: "<img /> <img />",
      })),
      ...["\u000A", "\u000D"].map((textContent) => ({
        code: `<img/>${textContent}<img/>`,
        name: "between",
        output: "<img />\n<img />",
      })),

      // many
      {
        code: "<img/>\u0009\u000A\u000C\u000D\u0020<img/>",
        output: "<img />\n\n<img />",
      },

      // non-space
      ...[
        "\u2005",
        " \u2005        ",
        "        \u2005\u2005 ",
        "        \u2005        \u2005 ",
      ].map((textContent) => `<div>${textContent}</div>`),

      ...[
        "\u2005",
        " \u2005        ",
        "        \u2005\u2005 ",
        "        \u2005        \u2005 ",
      ].map((textContent) => `<img/>${textContent}<img/>`),

      "<i /> \u2005 | \u2005 <i />",

      "<p><span>X</span> \u2005 or \u2005 <span>Y</span></p><p>X \u2005 or \u2005 Y</p>",

      {
        name: "`U+2005` should format like `U+005F` not like `U+0020`",
        code: outdent`
          <!-- U+2005 -->
          <div>before<span>\u2005</span>afterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafter</div>
          <!-- U+005F -->
          <div>before<span>\u005F</span>afterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafter</div>
          <!-- U+0020 -->
          <div>before<span>\u0020</span>afterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafterafter</div>
        `,
      },
    ],
  },
  ["glimmer"],
  {
    htmlWhitespaceSensitivity: "strict",
    printWidth: 40,
  }
);
