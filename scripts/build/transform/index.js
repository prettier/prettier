import path from "node:path";
import babelGenerator from "@babel/generator";
import { parse } from "@babel/parser";
import { traverseFast as traverse } from "@babel/types";
import { outdent } from "outdent";
import { PROJECT_ROOT, SOURCE_DIR } from "../../utils/index.js";
import allTransforms from "./transforms/index.js";

const generate = babelGenerator.default;

/* Doesn't work for dependencies, optional call, computed property, and spread arguments */

function transform(original, file) {
  if (
    !(
      file.startsWith(SOURCE_DIR) ||
      file.startsWith(path.join(PROJECT_ROOT, "node_modules/camelcase/")) ||
      file.startsWith(
        path.join(PROJECT_ROOT, "node_modules/angular-estree-parser/"),
      ) ||
      file.startsWith(path.join(PROJECT_ROOT, "node_modules/jest-docblock/")) ||
      file.startsWith(path.join(PROJECT_ROOT, "node_modules/espree/")) ||
      file.startsWith(
        path.join(
          PROJECT_ROOT,
          "node_modules/@typescript-eslint/typescript-estree/",
        ),
      ) ||
      file.startsWith(path.join(PROJECT_ROOT, "node_modules/meriyah/")) ||
      file.startsWith(path.join(PROJECT_ROOT, "node_modules/@glimmer/"))
    )
  ) {
    return original;
  }

  const transforms = allTransforms.filter(
    (transform) => !transform.shouldSkip(original, file),
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
      if (!transform.test(node)) {
        continue;
      }

      transform.transform(node);

      if (transform.inject) {
        injected.add(transform.inject);
      }

      changed ||= true;
    }
  });

  if (!changed) {
    return original;
  }

  let { code } = generate(
    ast,
    {
      sourceFileName: file,
      experimental_preserveFormat: true,
      retainLines: true,
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

export default transform;
