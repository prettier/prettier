import { outdent } from "outdent";

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      ...[".", "?."].map((access) => ({
        name: `member access ${access}`,
        code: `const hexColor = (rawColor.startsWith("#") ? rawColor : \`#\${rawColor}\`)${access}toLowerCase();`,
        output:
          outdent`
            const hexColor = (
              rawColor.startsWith("#") ? rawColor : \`#\${rawColor}\`
            )${access}toLowerCase();
          ` + "\n",
      })),
      {
        name: "single-line member access",
        code: "const value = (a ? b : c).toString();",
        output: "const value = (a ? b : c).toString();\n",
      },
    ],
  },
  ["babel", "flow", "typescript"],
  { experimentalTernaries: true, printWidth: 72 },
);
