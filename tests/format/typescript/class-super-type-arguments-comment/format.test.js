runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "own-line comment before type arguments",
        code: "class A extends B\n// comment\n<T> {}",
        output: "class A extends B<T> {} // comment\n",
      },
      {
        name: "trailing comment before type arguments",
        code: "class A extends B // comment\n<T> {}",
        output: "class A extends B<T> {} // comment\n",
      },
      {
        name: "comment before type arguments with a nonempty body",
        code: "class A extends B\n// comment\n<T> { m() {} }",
        output: "class A extends B<T> {\n  m() {}\n} // comment\n",
      },
      {
        name: "comment before type arguments and implements",
        code: "class A extends B\n// comment\n<T> implements I {}",
        output: "class A extends B<T> implements I {} // comment\n",
      },
      {
        name: "comment in a class expression",
        code: "const C = class extends B\n// comment\n<T> {};",
        output: "const C = class extends B<T> {}; // comment\n",
      },
      {
        name: "own-line TypeScript directive stays before type arguments",
        code: "class B {}\nclass A extends B\n// @ts-expect-error\n<T> {}",
        output: "class B {}\nclass A extends B\n// @ts-expect-error\n<T> {}\n",
      },
      {
        name: "trailing TypeScript directive stays before type arguments",
        code: "class B {}\nclass A extends B // @ts-ignore\n<T> {}",
        output: "class B {}\nclass A extends B // @ts-ignore\n<T> {}\n",
      },
      {
        name: "line-scoped lint directive stays before type arguments",
        code: "class A extends B\n// eslint-disable-next-line no-undef\n<T> {}",
        output:
          "class A extends B\n// eslint-disable-next-line no-undef\n<T> {}\n",
      },
      {
        name: "directive with an implements clause",
        code: "class A extends B\n// @ts-expect-error\n<T> implements I {}",
        output:
          "class A\n  extends B\n  // @ts-expect-error\n  <T>\n  implements I {}\n",
      },
      {
        name: "same-line lint directive stays beside the superclass",
        code: "class A extends B // eslint-disable-line no-undef\n<T> { m() {} }",
        output:
          "class A extends B // eslint-disable-line no-undef\n<T> {\n  m() {}\n}\n",
      },
    ],
  },
  ["typescript"],
);
