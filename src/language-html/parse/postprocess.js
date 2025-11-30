import {
  getHtmlTagDefinition,
  ParseSourceSpan,
  RecursiveVisitor,
  visitAll,
} from "angular-html-parser";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import HTML_ELEMENT_ATTRIBUTES from "../utilities/html-elements-attributes.evaluate.js";
import HTML_TAGS from "../utilities/html-tags.evaluate.js";
import isUnknownNamespace from "../utilities/is-unknown-namespace.js";
import { Node } from "./ast.js";
import { parseIeConditionalComment } from "./conditional-comment.js";

/**
@import {ParseOptions as AngularHtmlParserParseOptions, Ast, ParseTreeResult} from "angular-html-parser";
@import {ParseOptions} from "./parse-options.js";
*/

class Visitor extends RecursiveVisitor {
  // Angular does not visit to the children of expansionCase
  // https://github.com/angular/angular/blob/e3a6bf9b6c3bef03df9bfc8f05b817bc875cbad6/packages/compiler/src/ml_parser/ast.ts#L161
  visitExpansionCase(ast, context) {
    if (context.parseOptions.name === "angular") {
      // @ts-expect-error
      this.visitChildren(context, (visit) => {
        visit(ast.expression);
      });
    }
  }
  visit(node, { parseOptions }) {
    restoreNameAndValue(node);
    addTagDefinition(node, parseOptions);
    normalizeName(node, parseOptions);
    fixSourceSpan(node);
  }
}

function postprocess(rawAst, frontMatter, parseOptions, parseSubHtml) {
  visitAll(new Visitor(), rawAst.children, { parseOptions });

  if (frontMatter) {
    rawAst.children.unshift(frontMatter);
  }

  const ast = new Node(rawAst);

  ast.walk((node) => {
    if (node.kind === "comment") {
      const ieConditionalComment = parseIeConditionalComment(
        node,
        parseSubHtml,
      );
      if (ieConditionalComment) {
        node.parent.replaceChild(node, ieConditionalComment);
      }
    }

    normalizeAngularControlFlowBlock(node);
    normalizeAngularLetDeclaration(node);
    normalizeAngularIcuExpression(node);
  });

  return ast;
}

// `@else    if`
function normalizeAngularControlFlowBlock(node) {
  if (node.kind !== "block") {
    return;
  }

  node.name = node.name.toLowerCase().replaceAll(/\s+/gu, " ").trim();
  node.kind = "angularControlFlowBlock";

  if (!isNonEmptyArray(node.parameters)) {
    delete node.parameters;
    return;
  }

  for (const parameter of node.parameters) {
    parameter.kind = "angularControlFlowBlockParameter";
  }

  node.parameters = {
    kind: "angularControlFlowBlockParameters",
    children: node.parameters,
    sourceSpan: new ParseSourceSpan(
      node.parameters[0].sourceSpan.start,
      node.parameters.at(-1).sourceSpan.end,
    ),
  };
}

function normalizeAngularLetDeclaration(node) {
  if (node.kind !== "letDeclaration") {
    return;
  }

  // Similar to `VariableDeclarator` in estree
  node.kind = "angularLetDeclaration";
  node.id = node.name;
  node.init = {
    kind: "angularLetDeclarationInitializer",
    sourceSpan: new ParseSourceSpan(node.valueSpan.start, node.valueSpan.end),
    value: node.value,
  };

  delete node.name;
  delete node.value;
}

function normalizeAngularIcuExpression(node) {
  if (node.kind === "expansion") {
    node.kind = "angularIcuExpression";
  }
  if (node.kind === "expansionCase") {
    node.kind = "angularIcuCase";
  }
}

function lowerCaseIf(text, fn) {
  const lowerCasedText = text.toLowerCase();
  return fn(lowerCasedText) ? lowerCasedText : text;
}

/**
 * @param {Ast.Attribute | Ast.Element} node
 */
function restoreName(node) {
  const namespace = node.name.startsWith(":")
    ? node.name.slice(1).split(":")[0]
    : null;
  const rawName = node.nameSpan.toString();
  const hasExplicitNamespace =
    namespace !== null && rawName.startsWith(`${namespace}:`);
  const name = hasExplicitNamespace
    ? rawName.slice(namespace.length + 1)
    : rawName;

  node.name = name;
  // @ts-expect-error -- expected
  node.namespace = namespace;
  // @ts-expect-error -- expected
  node.hasExplicitNamespace = hasExplicitNamespace;
}

/**
 * @param {Ast.Node} node
 */
function restoreNameAndValue(node) {
  switch (node.kind) {
    case "element":
      restoreName(node);
      for (const attr of node.attrs) {
        restoreName(attr);
        if (!attr.valueSpan) {
          attr.value = null;
        } else {
          attr.value = attr.valueSpan.toString();
          if (/["']/u.test(attr.value[0])) {
            attr.value = attr.value.slice(1, -1);
          }
        }
      }
      break;

    case "comment":
      node.value = node.sourceSpan
        .toString()
        .slice("<!--".length, -"-->".length);
      break;

    case "text":
      node.value = node.sourceSpan.toString();
      break;

    // No default
  }
}

/**
 * @param {Ast.Node} node
 * @param {ParseOptions} parseOptions
 */
function addTagDefinition(node, parseOptions) {
  if (node.kind === "element") {
    const tagDefinition = getHtmlTagDefinition(
      parseOptions.isTagNameCaseSensitive ? node.name : node.name.toLowerCase(),
    );
    if (
      // @ts-expect-error -- we add it
      !node.namespace ||
      // @ts-expect-error -- we add it
      node.namespace === tagDefinition.implicitNamespacePrefix ||
      isUnknownNamespace(node)
    ) {
      // @ts-expect-error -- expected
      node.tagDefinition = tagDefinition;
    } else {
      // @ts-expect-error -- expected
      node.tagDefinition = getHtmlTagDefinition(""); // the default one
    }
  }
}

function fixSourceSpan(node) {
  if (node.sourceSpan && node.endSourceSpan) {
    node.sourceSpan = new ParseSourceSpan(
      node.sourceSpan.start,
      node.endSourceSpan.end,
    );
  }
}

function normalizeName(node, parseOptions) {
  if (node.kind === "element") {
    if (
      parseOptions.normalizeTagName &&
      (!node.namespace ||
        node.namespace === node.tagDefinition.implicitNamespacePrefix ||
        isUnknownNamespace(node))
    ) {
      node.name = lowerCaseIf(node.name, (lowerCasedName) =>
        HTML_TAGS.has(lowerCasedName),
      );
    }

    if (parseOptions.normalizeAttributeName) {
      for (const attr of node.attrs) {
        if (!attr.namespace) {
          attr.name = lowerCaseIf(
            attr.name,
            (lowerCasedAttrName) =>
              HTML_ELEMENT_ATTRIBUTES.has(node.name) &&
              (HTML_ELEMENT_ATTRIBUTES.get("*").has(lowerCasedAttrName) ||
                HTML_ELEMENT_ATTRIBUTES.get(node.name).has(lowerCasedAttrName)),
          );
        }
      }
    }
  }
}

export { postprocess };
