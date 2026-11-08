import { printDefiniteToken, printOptionalToken } from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

function shouldEscapeIdentifier(path) {
  return (
    // `for (using o\u{66} of foo);`
    // https://github.com/babel/babel/pull/18430
    path.match(
      ({ name }) => name === "of",
      (node, key) => node.type === "VariableDeclarator" && key === "id",
      (node, key) =>
        node.type === "VariableDeclaration" &&
        node.kind === "using" &&
        key === "declarations",
      (node, key) => node.type === "ForOfStatement" && key === "left",
    ) ||
    // cspell:disable-next-line
    // `export asyn\u{63} from "async";`
    path.match(
      ({ name }) => name === "async",
      (node, key) =>
        node.type === "ExportDefaultSpecifier" && key === "exported",
      (node, key) =>
        node.type === "ExportNamedDeclaration" && key === "specifiers",
    )
  );
}

const escapeIdentifier = (name) =>
  String.raw`${name.slice(0, -1)}\u{${name.codePointAt(name.length - 1).toString(16)}}`;

const printIdentifierName = (path) => {
  const {
    node: { name },
  } = path;
  return shouldEscapeIdentifier(path) ? escapeIdentifier(name) : name;
};

function printIdentifier(path, options, print) {
  return [
    printIdentifierName(path),
    printOptionalToken(path),
    printDefiniteToken(path),
    printTypeAnnotationProperty(path, print),
  ];
}

export { printIdentifier };
