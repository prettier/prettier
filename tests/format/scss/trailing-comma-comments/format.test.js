import { outdent } from "outdent";

for (const trailingComma of ["all", "none"]) {
  runFormatTest(
    {
      importMeta: import.meta,
      snippets: [1, 2, 3].flatMap((commentCount) =>
        ["", ","].map((comma) => {
          const comments = Array.from(
            { length: commentCount },
            (_, index) => `// Comment ${index + 1}`,
          ).join("\n  ");

          return {
            name: `${commentCount} trailing comments ${comma ? "with" : "without"} comma`,
            code: outdent`
              $map: (
                "foo": 1,
                "bar": 2${comma} ${comments}
              );
            `,
            output:
              outdent`
                $map: (
                  "foo": 1,
                  "bar": 2${trailingComma === "none" ? "" : ","} ${comments}
                );
              ` + "\n",
          };
        }),
      ),
    },
    ["scss"],
    { trailingComma },
  );
}
