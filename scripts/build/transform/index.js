import path from "node:path";
import generate from "@babel/generator";
import { parse } from "@babel/parser";
import { traverseFast as traverse } from "@babel/types";
import { outdent } from "outdent";
import { PROJECT_ROOT, SOURCE_DIR } from "../../utils/index.js";
import allTransforms from "./transforms/index.js";

/* Doesn't work for dependencies */

function shouldTransform(file, buildOptions) {
  const allowedDirectories = buildOptions.reuseDocModule
    ? [SOURCE_DIR]
    : [
        SOURCE_DIR,
        ...[
          /* spell-checker: disable */
          "camelcase",
          "angular-estree-parser",
          "jest-docblock",
          "espree",
          "@babel/parser",
          "@typescript-eslint/typescript-estree",
          "meriyah",
          "@glimmer",
          "@prettier/cli",
          "hermes-parser",
          "kasi",
          "fast-string-truncated-width",
          "fast-ignore",
          "hashery",
          /* spell-checker: enable */
        ].map((directory) =>
          path.join(PROJECT_ROOT, `node_modules/${directory}/`),
        ),
      ];

  return allowedDirectories.some((directory) => file.startsWith(directory));
}

function transform(original, file, buildOptions) {
  if (!shouldTransform(file, buildOptions)) {
    return original;
  }

  const transforms = allTransforms.filter(
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
