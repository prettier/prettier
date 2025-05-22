runFormatTest(
  {
    importMeta: import.meta,
    /*
    Missed HTML void tags in glimmer parser
    https://github.com/glimmerjs/glimmer-vm/blob/ec5648f3895b9ab8d085523be001553746221449/packages/%40glimmer/syntax/lib/parser/tokenizer-event-handlers.ts#LL7C13-L7C13
    https://github.com/glimmerjs/glimmer-vm/blob/ec5648f3895b9ab8d085523be001553746221449/packages/%40glimmer/syntax/lib/generation/printer.ts#L8-L9
    Please move tags to `tests/format/misc/errors/handlebars/format.test.js`
    when removing from this list
    */
    snippets: [
      "basefont",
      "bgsound",
      "frame",
      "image",
      "isindex",
      "menuitem",
      "nextid",
    ].map((tag) => ({ name: tag, code: `<${tag}> text </${tag}>` })),
  },
  ["glimmer"],
);
