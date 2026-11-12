const declarations = [
  "declare function f(  ): void;",
  'declare module "x";',
  "export declare function f(  ): void;",
  'export declare module "x";',
  "export default function f(  );",
  "for (;;) function f(  );",
  "if (x) function f(); else function g(  );",
  "for (;;) if (x) while (y) label: function f(  );",
  "declare function first();\n// prettier-ignore\nexport declare function f(  ): void;",
  'declare function first();\n// prettier-ignore\nexport declare module "x";',
  "declare function first();\n// prettier-ignore\nfor (;;) function f(  );",
];

for (const semi of [false, true]) {
  runFormatTest(
    {
      importMeta: import.meta,
      snippets: declarations.map((declaration) => ({
        code: `const before=0;
<<<PRETTIER_RANGE_START>>>${declaration}<<<PRETTIER_RANGE_END>>> // trailing { }
/* between { } */
{ const live=1; }
const after=2;
`,
      })),
    },
    ["typescript"],
    { semi },
  );
}
