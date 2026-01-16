import * as prettier from "../../../../src/index.js";
import { expectType } from "ts-expect";

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
        expectType<PluginAST>(node);
        return 0;
      },
      locEnd: (node) => {
        expectType<PluginAST>(node);
        return 0;
      },
    },
  },
  printers: {
    lines: {
      print(path, options, print) {
        expectType<prettier.AstPath<PluginAST>>(path);
        expectType<(path: prettier.AstPath<PluginAST>) => prettier.Doc>(print);

        const node = path.getValue();
        expectType<PluginAST>(node);

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
      type: "boolean",
      category: "Test",
      default: true,
      description: "Move open brace for code blocks onto new line.",
      oppositeDescription:
        "Don't move open brace for code blocks onto new line.",
    },
    testBoolArrOption: {
      type: "boolean",
      array: true,
      category: "Test",
      default: [{ value: [true, false, true] }],
      deprecated: true,
      description: "Move open brace for code blocks onto new line.",
    },
    testIntOption: {
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
      type: "int",
      category: "Test",
      default: [{ value: [3, 8, 12] }],
      array: true,
      description: "This is a number.",
    },
    testStringOption: {
      type: "string",
      category: "Test",
      default: "default",
      description: "This is a string.",
    },
    testStringArrOption: {
      type: "string",
      category: "Test",
      default: [{ value: ["one", "two", "three"] }],
      array: true,
      description: "This is a string.",
    },
    testChoiceOption: {
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
      type: "choice",
      default: [{ value: "banana" }, { value: "apple" }],
      choices: [
        { value: "apple", description: "A fruit." },
        { value: "orange", description: "A different fruit." },
        {
          value: "banana",
          description: "Added in 1.0.5, made default in 1.0.7.",
        },
      ],
      category: "Test",
      description: "Choose one of three.",
    },
    testPathOption: {
      type: "path",
      category: "Test",
      default: "./path.js",
    },
    testPathArrOption: {
      type: "path",
      category: "Test",
      array: true,
      default: [{ value: ["./pathA.js", "./pathB.js"] }],
    },
    testNoDefaultOption: {
      type: "path",
      category: "Test",
    },
  },
};

prettier.format("a line!", { parser: "lines", plugins: [plugin] });
prettier.getFileInfo("path/to/some/file", { plugins: [plugin] });
prettier.getSupportInfo({ plugins: [plugin] });
