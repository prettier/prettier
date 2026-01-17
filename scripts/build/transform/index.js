import path from "node:path";
import generate from "@babel/generator";
import { parse } from "@babel/parser";
import { traverseFast as traverse } from "@babel/types";
import { outdent } from "outdent";
import { PROJECT_ROOT, SOURCE_DIR } from "../../utilities/index.js";
import * as transforms from "./transforms/index.js";

const packageTransforms = new Map([
  /* spell-checker: disable */
  [
    transforms["method-replace-all"],
    [
      "@prettier/cli",
      "@typescript-eslint/typescript-estree",
      "camelcase",
      "fast-ignore",
      "fast-string-truncated-width",
      "hashery",
      "hermes-parser",
      "jest-docblock",
      "kasi",
      "meriyah",
    ],
  ],
  [
    transforms["method-at"],
    ["@glimmer/syntax", "angular-estree-parser", "espree"],
  ],
  [transforms["object-has-own"], ["@babel/parser", "meriyah"]],
  [transforms["string-raw"], ["camelcase", "@angular/compiler"]],
  [transforms["method-is-well-formed"], ["meriyah"]],
  /* spell-checker: enable */
]);

const allTransforms = Object.values(transforms);
const sourceTransforms = allTransforms.filter(
  (transform) => transform !== transforms["method-is-well-formed"],
);
const isPackageFile = (file, packageName) =>
  file.startsWith(path.join(PROJECT_ROOT, `node_modules/${packageName}/`));

function getTransforms(original, file) {
  if (file.startsWith(SOURCE_DIR)) {
    return sourceTransforms;
  }

  const transforms = [];
  for (const [transform, packageNames] of packageTransforms) {
    if (packageNames.some((packageName) => isPackageFile(file, packageName))) {
      transforms.push(transform);
    }
  }

  return transforms;
}

function transform(original, file, buildOptions) {
  const transforms = // For test
    (
      buildOptions.__isSyntaxTransformUnitTest
        ? allTransforms
        : getTransforms(original, file, buildOptions)
    ).filter(
      (transform) => !transform.shouldSkip(original, file, buildOptions),
    );

  if (transforms.length === 0) {
    return original;
  }

  let changed = false;
  const injected = new Set();

  const ast = parse(original, {
    filename: file,
    sourceType: "module",
    tokens: true,
    createParenthesizedExpressions: true,
  });
  traverse(ast, (node) => {
    for (const transform of transforms) {
      if (!transform.test(node, file)) {
        continue;
      }

      changed ||= true;

      if (transform.inject) {
        injected.add(transform.inject);
      }

      const replacement = transform.transform(node, file);
      if (replacement && replacement !== node) {
        replaceNode(node, replacement);
      }
    }
  });

  if (!changed) {
    return original;
  }

  let { code } = generate(
    ast,
    {
      sourceFileName: file,
      comments: true,
      jsescOption: null,
      minified: false,
      compact: false,
    },
    original,
  );

  if (injected.size > 0) {
    code = outdent`
      ${[...injected].join("\n")}

      ${code}
    `;
  }

  return code;
}

function replaceNode(original, object) {
  for (const key of Object.keys(original)) {
    delete original[key];
  }

  Object.assign(original, object);
}

export default transform;
