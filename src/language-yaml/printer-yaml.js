"use strict";

const { insertPragma, isPragma } = require("./pragma");
const {
  getAncestorCount,
  getLast,
  getLastDescendantNode,
  hasExplicitDocumentEnd,
  hasPrettierIgnore,
  isLastDescendantNode,
  isNextLineEmpty,
  isNode,
  restoreBlockFoldedValue
} = require("./utils");
const {
  align,
  breakParent,
  concat,
  dedent,
  dedentToRoot,
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  lineSuffix,
  literalline,
  markAsRoot,
  softline
} = require("../doc").builders;

function genericPrint(path, options, print) {
  const node = path.getValue();
  const parentNode = path.getParentNode();

  const tag =
    "tag" in node && node.tag.type !== "null" ? path.call(print, "tag") : "";
  const anchor =
    "anchor" in node && node.anchor.type !== "null"
      ? path.call(print, "anchor")
      : "";

  const nextEmptyLine =
    (node.type === "mapping" ||
      node.type === "sequence" ||
      node.type === "comment" ||
      node.type === "directive" ||
      node.type === "mappingItem" ||
      node.type === "sequenceItem") &&
    !isLastDescendantNode(path)
      ? printNextEmptyLine(path, options.originalText)
      : "";

  return concat([
    "leadingComments" in node && node.leadingComments.length !== 0
      ? concat([
          (node.type === "sequence" || node.type === "mapping") &&
          (parentParentNode =>
            parentParentNode.type === "mappingItem" &&
            !(
              node.leadingComments.length !== 0 &&
              !isImplicitMappingItem(parentParentNode, path.getParentNode(2))
            ))(path.getParentNode(1)) &&
          !tag &&
          !anchor
            ? hardline
            : "",
          join(hardline, path.map(print, "leadingComments")),
          hardline
        ])
      : "",
    tag,
    tag && anchor ? " " : "",
    anchor,
    (node.type === "sequence" || node.type === "mapping") &&
    node.middleComments.length === 0
      ? tag ||
        anchor ||
        (parentNode.type !== "documentBody" &&
          parentNode.type !== "sequenceItem" &&
          node.leadingComments.length === 0 &&
          !(
            parentNode.type === "mappingValue" &&
            (parentParentNode =>
              parentParentNode.type === "mappingItem" &&
              ("trailingComments" in parentParentNode.key.node &&
                parentParentNode.key.node.trailingComments.length !== 0))(
              path.getParentNode(1)
            )
          ) &&
          !(parentParentNode =>
            parentParentNode.type === "mappingItem" &&
            !isImplicitMappingItem(parentParentNode, path.getParentNode(2)))(
            path.getParentNode(1)
          ))
        ? hardline
        : ""
      : tag || anchor
        ? " "
        : "",
    "middleComments" in node && node.middleComments.length !== 0
      ? concat([
          node.middleComments.length === 1 ? "" : hardline,
          join(hardline, path.map(print, "middleComments")),
          hardline
        ])
      : "",
    hasPrettierIgnore(path)
      ? options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset
        )
      : group(_print(node, parentNode, path, options, print)),
    node.type !== "blockFolded" &&
    node.type !== "blockLiteral" &&
    "trailingComments" in node &&
    node.trailingComments.length === 1
      ? lineSuffix(
          concat([
            " ",
            isSingleLineNode(node) &&
            parentNode.type === "mappingValue" &&
            path.getParentNode(1).type === "mappingItem"
              ? ""
              : breakParent,
            path.call(print, "trailingComments", 0)
          ])
        )
      : "",
    nextEmptyLine
  ]);
}

function _print(node, parentNode, path, options, print) {
  switch (node.type) {
    case "root":
      return concat([
        concat(
          path.map(
            (childPath, index) =>
              index === node.children.length - 1
                ? print(childPath)
                : concat([
                    print(childPath),
                    node.children[index].trailingComments.length !== 0 ||
                    (childPath.call(hasPrettierIgnore, "body") &&
                      hasExplicitDocumentEnd(
                        node.children[index].position.end,
                        options.originalText
                      ))
                      ? ""
                      : concat([hardline, "..."]),
                    hardline
                  ]),
            "children"
          )
        ),
        node.children.length === 0 ||
        (lastDescendantNode =>
          (lastDescendantNode.type === "blockFolded" ||
            lastDescendantNode.type === "blockLiteral") &&
          (/[^\S\n]\n?$/.test(lastDescendantNode.value) ||
            (lastDescendantNode.chomping === "keep" &&
              lastDescendantNode.value === "\n")))(getLastDescendantNode(node))
          ? ""
          : hardline
      ]);
    case "document":
      return concat([
        node.head.children.length === 0
          ? path.call(print, "body")
          : join(
              hardline,
              [path.call(print, "head"), "---"].concat(
                node.body.children.length === 0 ? [] : path.call(print, "body")
              )
            ),
        node.trailingComments.length !== 0 ? concat([hardline, "..."]) : ""
      ]);
    case "documentHead":
    case "documentBody":
      return join(hardline, path.map(print, "children"));
    case "directive":
      return concat(["%", join(" ", [node.name].concat(node.parameters))]);
    case "comment":
      return concat(["#", node.value]);
    case "alias":
      return concat(["*", node.value]);
    case "null":
      return "";
    case "verbatimTag":
      return concat(["!<", node.value, ">"]);
    case "shorthandTag":
      return concat([node.handle, node.suffix]);
    case "nonSpecificTag":
      return "!";
    case "anchor":
      return concat(["&", node.value]);
    case "plain":
      return join(hardline, node.value.replace(/\n/g, "\n\n").split("\n"));
    case "quoteDouble": // TODO: --single-quote
    case "quoteSingle":
      return options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      );
    case "blockFolded": // TODO: --prose-wrap
    case "blockLiteral": {
      const value =
        node.chomping === "strip" ||
        (node.chomping === "clip" &&
          options.originalText.slice(
            node.position.end.offset - 2,
            node.position.end.offset
          ) === "\n\n") ||
        (node.chomping === "keep" && node.value === "\n")
          ? node.value
          : node.value.replace(/\n$/, "");
      return concat([
        node.type === "blockFolded" ? ">" : "|",
        node.indent === null ? "" : node.indent.toString(),
        node.chomping === "clip" ? "" : node.chomping === "keep" ? "+" : "-",
        node.trailingComments.length !== 0
          ? concat([" ", join(hardline, path.map(print, "trailingComments"))])
          : "",
        value === ""
          ? ""
          : (node.indent === null ? dedent : dedentToRoot)(
              align(
                node.indent === null
                  ? options.tabWidth
                  : node.indent -
                    1 +
                    getAncestorCount(
                      path,
                      ancestorNode =>
                        ancestorNode.type === "sequence" ||
                        ancestorNode.type === "mapping"
                    ),
                (node.chomping === "keep" && node.value === "\n"
                  ? dedentToRoot
                  : markAsRoot)(
                  concat(
                    (node.type === "blockLiteral"
                      ? value
                      : restoreBlockFoldedValue(value)
                    )
                      .split("\n")
                      .reduce(
                        (reduced, lineContent, index, lines) =>
                          reduced.concat(
                            node.type === "blockLiteral"
                              ? lineContent
                              : fill(
                                  join(
                                    line,
                                    lineContent
                                      // split by single space
                                      .replace(/(^|[^ ]) ([^ ]|$)/g, "$1\n$2")
                                      .split("\n")
                                  ).parts
                                ),
                            index === lines.length - 1 &&
                            !/\s$/.test(lineContent)
                              ? []
                              : /\s$/.test(lineContent)
                                ? index === lines.length - 1
                                  ? dedentToRoot(literalline)
                                  : literalline
                                : hardline
                          ),
                        [hardline]
                      )
                  )
                )
              )
            )
      ]);
    }
    case "sequence":
      return join(hardline, path.map(print, "children"));
    case "sequenceItem":
      return concat(["- ", align(2, path.call(print, "node"))]);
    case "mappingKey":
      return isImplicitMappingItem(parentNode, path.getParentNode(1))
        ? path.call(print, "node")
        : concat(["? ", align(2, path.call(print, "node"))]);
    case "mappingValue":
      return isImplicitMappingItem(parentNode, path.getParentNode(1))
        ? concat([
            concat([
              needsSpaceInFrontOfMappingValue(parentNode) ? " " : "",
              ":"
            ]),
            (doc => (node.node.type === "sequence" ? doc : indent(doc)))(
              concat([
                node.node.type === "null"
                  ? ""
                  : (keyNode =>
                      "trailingComments" in keyNode &&
                      keyNode.trailingComments.length !== 0 &&
                      (node.node.type !== "blockFolded" &&
                        node.node.type !== "blockLiteral"))(parentNode.key.node)
                    ? hardline
                    : isInlineNode(node.node)
                      ? line
                      : " ",
                path.call(print, "node")
              ])
            )
          ])
        : concat([
            ":",
            node.node.type === "null" ? "" : " ",
            align(2, path.call(print, "node"))
          ]);
    case "mapping":
      return join(hardline, path.map(print, "children"));
    case "mappingItem":
    case "flowMappingItem": {
      return ((node.type === "flowMappingItem" &&
        parentNode.type === "flowSequence") ||
        node.type === "mappingItem") &&
        node.key.type === "null" &&
        node.value.type === "null"
        ? concat([":", line])
        : join(
            isImplicitMappingItem(node, parentNode) ? "" : hardline,
            [
              node.key.type === "null" ? "" : path.call(print, "key"),
              node.value.type === "null" ? "" : path.call(print, "value")
            ].filter(doc => doc !== "")
          );
    }
    case "flowMapping":
    case "flowSequence": {
      const openMarker = node.type === "flowMapping" ? "{" : "[";
      const closeMarker = node.type === "flowMapping" ? "}" : "]";
      const bracketSpacing =
        node.type === "flowMapping" &&
        node.children.length !== 0 &&
        options.bracketSpacing
          ? line
          : softline;
      return concat([
        openMarker,
        indent(
          concat([
            bracketSpacing,
            concat(
              path.map(
                (childPath, index) =>
                  concat([
                    print(childPath),
                    index === node.children.length - 1
                      ? ""
                      : concat([
                          ",",
                          line,
                          printNextEmptyLine(childPath, options.originalText)
                        ])
                  ]),
                "children"
              )
            ),
            node.children.length !== 0 &&
            (lastItem =>
              (node.type === "flowMapping" &&
                lastItem.type === "flowMappingItem" &&
                lastItem.key.type === "null" &&
                lastItem.value.type === "null") ||
              (node.type === "flowSequence" &&
                lastItem.type === "flowSequenceItem" &&
                lastItem.node.type === "null"))(getLast(node.children))
              ? "," // trailing empty item
              : ifBreak(",", "")
          ])
        ),
        bracketSpacing,
        closeMarker
      ]);
    }
    case "flowSequenceItem":
      return path.call(print, "node");
    // istanbul ignore next
    default:
      throw new Error(`Unexpected node type ${node.type}`);
  }
}

/**
 * (implicit: indent)
 *
 *     key:
 *       value
 *
 * (explicit: align 2)
 *
 *     ? key
 *     : value
 */
function isImplicitMappingItem(node, parentNode) {
  /**
   *     { : value }
   */
  if (node.key.type === "null") {
    return false;
  }

  /**
   *     ? key
   *
   *     [ ? key ]
   *
   *     { key }
   */
  if (node.value.type === "null") {
    return parentNode.type === "flowMapping";
  }

  /**
   *     ? !!tag key
   *     : value
   */
  if (
    "tag" in node.key.node &&
    (node.key.node.tag.type !== "null" || node.key.node.anchor.type !== "null")
  ) {
    return false;
  }

  /**
   *     ? # comment
   *       key
   *     : value
   */
  if (
    "leadingComments" in node.key.node &&
    node.key.node.leadingComments.length !== 0
  ) {
    return false;
  }

  /**
   *     ? key
   *     # comment
   *     : value
   */
  if (
    "leadingComments" in node.value &&
    node.value.leadingComments.length !== 0
  ) {
    return false;
  }

  return isSingleLineNode(node.key.node);
}

function isSingleLineNode(node) {
  switch (node.type) {
    case "alias":
      return true;
    case "plain":
      return !node.value.includes("\n");
    case "quoteDouble":
    case "quoteSingle":
      return node.position.start.line === node.position.end.line;
    default:
      return false;
  }
}

function isInlineNode(node) {
  switch (node.type) {
    case "plain":
    case "quoteDouble":
    case "quoteSingle":
    case "alias":
    case "flowMapping":
    case "flowSequence":
    case "null":
      return true;
    default:
      return false;
  }
}

function needsSpaceInFrontOfMappingValue(node) {
  // istanbul ignore else
  if (node.key.type !== "null") {
    switch (node.key.node.type) {
      case "alias":
        return true;
      case "plain":
        return node.key.node.value === "<<";
    }
  }
  return false;
}

function printNextEmptyLine(path, originalText) {
  const node = path.getValue();
  const root = path.stack[0];

  root.isNextEmptyLinePrintedChecklist =
    root.isNextEmptyLinePrintedChecklist || [];

  if (!root.isNextEmptyLinePrintedChecklist[node.position.end.line]) {
    if (isNextLineEmpty(node, originalText)) {
      root.isNextEmptyLinePrintedChecklist[node.position.end.line] = true;
      return softline;
    }
  }

  return "";
}

function clean(node, newNode /*, parent */) {
  if (isNode(newNode)) {
    delete newNode.position;
    switch (newNode.type) {
      case "comment":
        // insert pragma
        if (isPragma(newNode.value)) {
          return null;
        }
        break;
    }
  }
}

module.exports = {
  print: genericPrint,
  massageAstNode: clean,
  insertPragma
};
