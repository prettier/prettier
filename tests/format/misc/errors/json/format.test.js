runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      "{foo}",
      '{["foo"]:"bar"}',
      '{"foo": ~1}',
      '{"foo": false || "bar"}',
      '{"foo": () => {}}',
      String.raw`packages\the-hub\cypress\fixtures\gridConfiguration.json`,
      "1+2",
      "{Infinity}",
      "{[key]: 1}",
      "{[key()]: 1}",
      "{['CallExpression']: 1}",
      "{['StringLiteral']: 1}",
      "{['string']: 1}",
      "{[1]: 1}",
      "{[Infinity]: 1}",
      "{[-Infinity]: 1}",
      "{[{key: 'value'}]: 1}",
      "{[[]]: 1}",
      "{[null]: 1}",
      "{key: +foo()}",
      "{key: void foo()}",
      "#!/usr/bin/env node\n{}",
      '"use strict"\n{}',
      "/* comment */",
      "// comment",
      "`foo${1}bar`",
      "-+1",
      "-+Infinity",
      "-undefined",
      "-null",
      "-false",
      "+'string'",
      "{key: +{}}",
      '{"identifier": identifier}',
      // JSON6 allow this, but babel can't parse
      "----123",
    ],
  },
  ["json", "json5", "json-stringify"],
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // Invalid JS expressions
      "[class {set foo() {}}]",
      "[class {foo() {this.#bar}}]",
      "[function(){ await 1 }]",
      // Should not mention babel plugin in error message
      // plugin `doExpressions`
      "[do {}]",
      // plugin `exportDefaultFrom`
      "[function() {export a from 'a'}]",
      "export a from 'a'",
      // plugin `functionBind`
      "[a::b]",
      // plugin `functionSent`
      "[function*() {function.sent}]",
      // plugin `throwExpressions`
      "[throw {}]",
      // plugin `partialApplication`
      "[foo(?)]",
      // plugin `decorators`
      "[@decorator class {}]",
      // plugin `importAssertions`
      "[import('a', {type:'json'})]",
      // plugin `decimal`
      "[1m]",
      // plugin `moduleBlocks`
      "[module {}]",
      // plugin `asyncDoExpressions`
      "[async do {}]",
      // plugin `regexpUnicodeSets`
      "[/a/v]",
      // plugin `destructuringPrivate`
      "[class {#foo;bar() {const {#foo: foo} = this;}}]",
      // plugin `decoratorAutoAccessors`
      "[class {accessor foo = 1}]",
      // plugin `importReflection`
      "[import('a', {reflect: 'module'})]",
      "import module a from 'a'",
      // plugin `explicitResourceManagement`
      "[function() { {using a = b} }]",
      "{using a = b}",
      // plugin `recordAndTuple`
      "[#[]]",
      "[#{}]",
      // plugin `v8intrinsic`
      "[foo%bar()]",
      // plugin `pipelineOperator`
      "['foo' |> bar]",
      "['foo' |> bar(%)]",
      // plugin `jsx`
      "[<foo></foo>]",
    ],
  },
  ["json"],
);
