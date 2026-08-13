runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // `name` can't contain `"`, `'`, or `=`
      "<Foo \"='' />",
      "<Foo &quot;='' />",
      "<Foo &34;='' />",
      "<Foo '='' />",
      "<Foo &apos;='' />",
      "<Foo &39;='' />",
      "<Foo =='' />",
      "<Foo &equals;='' />",
      "<Foo &#61;='' />",

      // `value` must be quoted
      "<Foo name=value />",

      // No space around
      // "<Foo name ='value' />",
      // "<Foo name= 'value' />",
    ],
  },
  ["mdx"],
);
