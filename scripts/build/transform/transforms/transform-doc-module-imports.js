import path from "node:path";
import { SOURCE_DIR } from "../../../utilities/index.js";
import getPublicDocFunctionality from "./get-public-doc-functionality.js";
import {
  createIdentifier,
  createMemberExpression,
  createStringLiteral,
} from "./utilities.js";

const DOC_MODULE_DIRECTORY = path.join(SOURCE_DIR, "document/");
const PUBLIC_DOC_MODULE_PATH = path.join(SOURCE_DIR, "document/public.js");

/**
 * @param {import("@babel/types").Node} node
 * @returns {boolean}
 */
function getImportDeclarationReplacement(node, file) {
  if (node.type !== "ImportDeclaration") {
    return;
  }

  const source = node.source.value;

  if (!source.startsWith(".")) {
    return;
  }

  const resolved = path.join(file, `../${source}`);

  if (
    !resolved.startsWith(DOC_MODULE_DIRECTORY) ||
    resolved === PUBLIC_DOC_MODULE_PATH
  ) {
    return;
  }

  const removed = [];
  const specifiers = node.specifiers
    .map((specifier) => {
      const { imported, local } = specifier;
      if (imported.type !== "Identifier" || local.type !== "Identifier") {
        return specifier;
      }

      const { name } = imported;

      const replacement = getPublicDocFunctionality(name, resolved);

      if (!replacement) {
        return specifier;
      }

      removed.push({ variable: local.name, ...replacement });
    })
    .filter(Boolean);

  if (removed.length === 0) {
    return;
  }

  return {
    node:
      removed.length === node.specifiers.length
        ? undefined
        : { ...node, specifiers },
    removed,
  };
}

/**
 * @param {import("@babel/types").Program} node
 * @returns {import("@babel/types").Program}
 */
function transformProgramWithoutCache(program, file) {
  const replacements = [];
  const body = program.body
    .map((node) => {
      const replacement = getImportDeclarationReplacement(node, file);

      if (!replacement) {
        return node;
      }

      replacements.push(...replacement.removed);

      return replacement.node;
    })
    .filter(Boolean);

  if (replacements.length === 0) {
    return;
  }

  const identityPrefix = "__doc_";

  const grouped = [];
  for (const replacement of replacements) {
    const group = grouped.find(
      (searching) => searching.namespace === replacement.namespace,
    );
    if (!group) {
      grouped.push({
        namespace: replacement.namespace,
        replacements: [replacement],
      });
    } else {
      group.replacements.push(replacement);
    }
  }

  body.unshift(
    {
      type: "ImportDeclaration",
      source: createStringLiteral(PUBLIC_DOC_MODULE_PATH),
      specifiers: grouped.map(({ namespace }) => ({
        type: "ImportSpecifier",
        imported: createIdentifier(namespace),
        local: createIdentifier(`${identityPrefix}${namespace}`),
      })),
    },
    {
      type: "VariableDeclaration",
      kind: "const",
      declarations: grouped.map(({ namespace, replacements }) => ({
        type: "VariableDeclarator",
        id: {
          type: "ObjectPattern",
          properties: replacements.map(({ variable, name }) => ({
            type: "ObjectProperty",
            key: createIdentifier(name),
            value: createIdentifier(variable),
            shorthand: name === variable,
          })),
        },
        init: createMemberExpression(`${identityPrefix}${namespace}`),
      })),
    },
  );

  return { ...program, body };
}

const cache = new WeakMap();
function transformProgram(program, file) {
  if (program.type !== "Program") {
    return program;
  }
  if (!cache.has(program)) {
    cache.set(program, transformProgramWithoutCache(program, file) ?? program);
  }

  return cache.get(program);
}

export default {
  shouldSkip: (text, file, buildOptions) =>
    !buildOptions.reuseDocModule || file.startsWith(DOC_MODULE_DIRECTORY),
  test: (program, file) => program !== transformProgram(program, file),
  transform: transformProgram,
};
