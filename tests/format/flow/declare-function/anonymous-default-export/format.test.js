runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "empty parameters",
        filename: "anonymous.js.flow",
        code: "export default function (): void;",
      },
      {
        name: "generic signature",
        filename: "generic.js.flow",
        code: "export default function <T>(value: T, ...rest: T[]): T;",
      },
      {
        name: "function return type",
        filename: "function-return.js.flow",
        code: "export default function (): (value: number) => string;",
      },
      {
        name: "generic function return type",
        filename: "generic-function-return.js.flow",
        code: "export default function (): <T>(value: T) => T;",
      },
      {
        name: "comments",
        filename: "comments.js.flow",
        code: "export default function /* before parameters */ (/* parameter */ value: number): /* return */ void;",
      },
    ],
  },
  ["flow"],
);
