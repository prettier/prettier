run_spec(
  {
    dirname: __dirname,
    snippets: ["class interface {}", 'import interface from "foo";'],
  },
  ["espree", "meriyah"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: [
      'interface = "foo";',
      "interface + 3;",
      "interface();",
      "class interface {}",
      "interface ? true : false;",
      "function interface() {}",
      'import interface from "foo";',
      "interface.foo;",
      "new interface();",
      '(interface, "foo");',
      "void interface;",
      'const interface = "foo";',
    ],
  },
  ["babel"]
);
