import * as prettier from "../../../../scripts/build/dts-files/index";

interface PluginAST {
  kind: "line";
  value: string;
}

const plugin: prettier.Plugin<PluginAST> = {
  languages: [
    {
      name: "Shell",
      parsers: ["sh"],
      interpreters: ["bash", "zsh"],
    },
  ],
  parsers: {
    lines: {
      parse(text, options) {
        return { kind: "line", value: "This is a line" };
      },
      astFormat: "lines",
      locStart: (node) => {
        node; // $ExpectType PluginAST
        return 0;
      },
      locEnd: (node) => {
        node; // $ExpectType PluginAST
        return 0;
      },
    },
  },
  printers: {
    lines: {
      print(path, options, print) {
        path; // $ExpectType AstPath<PluginAST>
        print; // $ExpectType (path: AstPath<PluginAST>) => Doc

        const node = path.getValue();
        node; // $ExpectType PluginAST

        return node.value;
      },
      printComment(commentPath, options) {
        const comment = commentPath.getValue();
        return comment.value;
      },
    },
  },
  options: {
    testBoolOption: {
      since: "1.0.1",
      type: "boolean",
      category: "Test",
      default: true,
      description: "Move open brace for code blocks onto new line.",
      oppositeDescription:
        "Don't move open brace for code blocks onto new line.",
    },
    testBoolArrOption: {
      since: "1.0.1",
      type: "boolean",
      array: true,
      category: "Test",
      default: [{ value: [true, false, true] }],
      deprecated: true,
      description: "Move open brace for code blocks onto new line.",
    },
    testIntOption: {
      since: "1.0.2",
      type: "int",
      category: "Global",
      default: 15,
      range: {
        start: 5,
        end: 100,
        step: 5,
      },
      deprecated: "Deprecated can be a string describing deprecation status.",
      description: "This is a number.",
    },
    testIntArrOption: {
      since: "forever",
      type: "int",
      category: "Test",
      default: [{ value: [3, 8, 12] }],
      array: true,
      description: "This is a number.",
    },
    testStringOption: {
      since: "1.0.0",
      type: "string",
      category: "Test",
      default: "default",
      description: "This is a string.",
    },
    testStringArrOption: {
      since: "1.0.0",
      type: "string",
      category: "Test",
      default: [{ value: ["one", "two", "three"] }],
      array: true,
      description: "This is a string.",
    },
    testChoiceOption: {
      since: "1.0.3",
      type: "choice",
      default: "one",
      choices: [
        { value: "one", description: "The number one" },
        { value: "two", description: "The number two" },
        { value: "three", description: "The number three" },
      ],
      category: "Test",
      description: "Choose one of three.",
    },
    testChoiceComplexOption: {
      since: "1.0.5",
      type: "choice",
      default: [{ since: "1.0.7", value: "banana" }, { value: "apple" }],
      choices: [
        { value: "apple", description: "A fruit." },
        { value: "orange", since: "1.0.6", description: "A different fruit." },
        {
          value: "banana",
          since: "1.0.5",
          description: "Added in 1.0.5, made default in 1.0.7.",
        },
      ],
      category: "Test",
      description: "Choose one of three.",
    },
    testPathOption: {
      since: "1.0.0",
      type: "path",
      category: "Test",
      default: "./path.js",
    },
    testPathArrOption: {
      since: "1.0.0",
      type: "path",
      category: "Test",
      array: true,
      default: [{ value: ["./pathA.js", "./pathB.js"] }],
    },
    testNoDefaultOption: {
      since: "1.0.0",
      type: "path",
      category: "Test",
    },
  },
};

prettier.format("a line!", { parser: "lines", plugins: [plugin] });
