"use strict";

const { insertPragma, isPragma } = require("./pragma");
const {
  getAncestorCount,
  getBlockValueLineContents,
  getFlowScalarLineContents,
  getLast,
  getLastDescendantNode,
  hasExplicitDocumentEndMarker,
  hasLeadingComments,
  hasMiddleComments,
  hasTrailingComments,
  hasEndComments,
  hasPrettierIgnore,
  isLastDescendantNode,
  isNextLineEmpty,
  isNode,
  isBlockValue
} = require("./utils");
const docBuilders = require("../doc").builders;
const {
  conditionalGroup,
  breakParent,
  concat,
  dedent,
  dedentToRoot,
  fill,
  group,
  hardline,
  ifBreak,
  join,
  line,
  lineSuffix,
  literalline,
  markAsRoot,
  softline
} = docBuilders;

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
    node.type !== "mappingValue" && hasLeadingComments(node)
      ? concat([join(hardline, path.map(print, "leadingComments")), hardline])
      : "",
    tag,
    tag && anchor ? " " : "",
    anchor,
    (node.type === "sequence" || node.type === "mapping") &&
    node.middleComments.length === 0
      ? tag || anchor
        ? hardline
        : ""
      : tag || anchor
        ? " "
        : "",
    hasMiddleComments(node)
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
    !isBlockValue(node) && hasTrailingComments(node) // trailing comments for block value are handled themselves
      ? lineSuffix(
          concat([
            " ",
            parentNode.type === "mappingKey" &&
            path.getParentNode(2).type === "mapping" &&
            isInlineNode(node)
              ? ""
              : breakParent,
            join(hardline, path.map(print, "trailingComments"))
          ])
        )
      : "",
    nextEmptyLine,
    hasEndComments(node)
      ? (endComments =>
          node.type === "sequenceItem" ? align(2, endComments) : endComments)(
          concat([hardline, join(hardline, path.map(print, "endComments"))])
        )
      : ""
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
                    hasTrailingComments(node.children[index]) ||
                    (childPath.call(hasPrettierIgnore, "body") &&
                      hasExplicitDocumentEndMarker(
                        node.children[index],
                        options.originalText
                      ))
                      ? ""
                      : concat([
                          hardline,
                          node.children[index + 1].head.children.length === 0
                            ? "---"
                            : "..."
                        ]),
                    hardline
                  ]),
            "children"
          )
        ),
        node.children.length === 0 ||
        (lastDescendantNode =>
          isBlockValue(lastDescendantNode) &&
          lastDescendantNode.chomping === "keep")(getLastDescendantNode(node))
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
        hasTrailingComments(node) ? concat([hardline, "..."]) : ""
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
      return printFlowScalarContent(
        node.type,
        options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset
        ),
        options
      );
    case "quoteDouble":
    case "quoteSingle": {
      const singleQuote = "'";
      const doubleQuote = '"';

      const raw = options.originalText.slice(
        node.position.start.offset + 1,
        node.position.end.offset - 1
      );

      if (
        (node.type === "quoteSingle" && raw.includes("\\")) ||
        (node.type === "quoteDouble" && /\\[^"]/.test(raw))
      ) {
        // only quoteDouble can use escape chars
        // and quoteSingle do not need to escape backslashes
        const originalQuote =
          node.type === "quoteDouble" ? doubleQuote : singleQuote;
        return concat([
          originalQuote,
          printFlowScalarContent(node.type, raw, options),
          originalQuote
        ]);
      } else if (raw.includes(doubleQuote)) {
        return concat([
          singleQuote,
          printFlowScalarContent(
            node.type,
            node.type === "quoteDouble"
              ? // double quote needs to be escaped by backslash in quoteDouble
                raw.replace(/\\"/g, doubleQuote)
              : raw,
            options
          ),
          singleQuote
        ]);
      }

      if (raw.includes(singleQuote)) {
        return concat([
          doubleQuote,
          printFlowScalarContent(
            node.type,
            node.type === "quoteSingle"
              ? // single quote needs to be escaped by 2 single quotes in quoteSingle
                raw.replace(/''/g, singleQuote)
              : raw,
            options
          ),
          doubleQuote
        ]);
      }

      const quote = options.singleQuote ? singleQuote : doubleQuote;
      return concat([
        quote,
        printFlowScalarContent(node.type, raw, options),
        quote
      ]);
    }
    case "blockFolded":
    case "blockLiteral": {
      const parentIndent = getAncestorCount(
        path,
        ancestorNode =>
          ancestorNode.type === "sequence" || ancestorNode.type === "mapping"
      );
      const isLastDescendant = isLastDescendantNode(path);
      return concat([
        node.type === "blockFolded" ? ">" : "|",
        node.indent === null ? "" : node.indent.toString(),
        node.chomping === "clip" ? "" : node.chomping === "keep" ? "+" : "-",
        hasTrailingComments(node)
          ? concat([" ", join(hardline, path.map(print, "trailingComments"))])
          : "",
        (node.indent === null ? dedent : dedentToRoot)(
          align(
            node.indent === null
              ? options.tabWidth
              : node.indent - 1 + parentIndent,
            concat(
              getBlockValueLineContents(node, {
                parentIndent,
                isLastDescendant,
                options
              }).reduce(
                (reduced, lineWords, index, lineContents) =>
                  reduced.concat(
                    index === 0
                      ? hardline
                      : lineContents[index - 1].length === 0
                        ? hardline
                        : index === lineContents.length - 1 &&
                          lineWords.length === 0
                          ? dedentToRoot(literalline)
                          : markAsRoot(literalline),
                    fill(join(line, lineWords).parts),
                    index === lineContents.length - 1 &&
                    node.chomping === "keep" &&
                    isLastDescendant
                      ? lineWords.length === 0 ||
                        !getLast(lineWords).endsWith(" ")
                        ? dedentToRoot(hardline)
                        : dedentToRoot(literalline)
                      : []
                  ),
                []
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
      return path.call(print, "node");
    case "mappingValue":
      return path.call(print, "node");
    case "mapping":
      return join(hardline, path.map(print, "children"));
    case "mappingItem":
    case "flowMappingItem": {
      if (node.key.type === "null" && node.value.type === "null") {
        return concat([":", line]);
      }

      const key = path.call(print, "key");
      const value = path.call(print, "value");

      if (node.value.type === "null") {
        return node.type === "flowMappingItem" &&
          path.getParentNode().type !== "flowSequence"
          ? key
          : concat(["? ", align(2, key)]);
      }

      if (node.key.type === "null") {
        return concat([
          ":",
          node.value.node.type === "null" ? "" : " ",
          align(2, value)
        ]);
      }

      const groupId = Symbol("mappingKey");

      const forceExplicitKey =
        hasLeadingComments(node.value) ||
        (node.key.type !== "null" && !isInlineNode(node.key.node));
      return forceExplicitKey
        ? concat([
            "? ",
            align(2, key),
            hardline,
            join(
              "",
              path
                .map(print, "value", "leadingComments")
                .map(comment => concat([comment, hardline]))
            ),
            ": ",
            align(2, value)
          ])
        : // force singleline
          isSingleLineNode(node.key.node) &&
          !hasLeadingComments(node.key.node) &&
          !hasMiddleComments(node.key.node) &&
          !hasTrailingComments(node.key.node) &&
          !hasEndComments(node.key) &&
          !hasLeadingComments(node.value.node) &&
          !hasMiddleComments(node.value.node) &&
          !hasEndComments(node.value) &&
          isAbsolutelyPrintedAsSingleLineNode(node.value.node, options)
          ? concat([
              key,
              needsSpaceInFrontOfMappingValue(node) ? " " : "",
              ": ",
              value
            ])
          : conditionalGroup([
              concat([
                group(
                  concat([ifBreak("? "), group(align(2, key), { id: groupId })])
                ),
                ifBreak(
                  concat([hardline, ": ", align(2, value)]),
                  indent(
                    concat([
                      needsSpaceInFrontOfMappingValue(node) ? " " : "",
                      ":",
                      hasLeadingComments(node.value.node) ||
                      (hasEndComments(node.value) &&
                        node.value.node.type !== "null") ||
                      (parentNode.type === "mapping" &&
                        hasTrailingComments(node.key.node) &&
                        isInlineNode(node.value.node)) ||
                      ((node.value.node.type === "mapping" ||
                        node.value.node.type === "sequence") &&
                        node.value.node.tag.type === "null" &&
                        node.value.node.anchor.type === "null")
                        ? hardline
                        : node.value.node.type === "null"
                          ? ""
                          : line,
                      value
                    ])
                  ),
                  { groupId }
                )
              ])
            ]);
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
      const isLastItemEmptyMappingItem =
        node.children.length !== 0 &&
        (lastItem =>
          lastItem.type === "flowMappingItem" &&
          lastItem.key.type === "null" &&
          lastItem.value.type === "null")(getLast(node.children));
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
                          node.children[index].position.start.line !==
                          node.children[index + 1].position.start.line
                            ? printNextEmptyLine(
                                childPath,
                                options.originalText
                              )
                            : ""
                        ])
                  ]),
                "children"
              )
            ),
            ifBreak(",", "")
          ])
        ),
        isLastItemEmptyMappingItem ? "" : bracketSpacing,
        closeMarker
      ]);
    }
    case "flowSequenceItem":
      return path.call(print, "node");
    // istanbul ignore next
    default:
      throw new Error(`Unexpected node type ${node.type}`);
  }

  function indent(doc) {
    return docBuilders.align(" ".repeat(options.tabWidth), doc);
  }
}

function align(n, doc) {
  return typeof n === "number" && n > 0
    ? docBuilders.align(" ".repeat(n), doc)
    : docBuilders.align(n, doc);
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

function isSingleLineNode(node) {
  switch (node.type) {
    case "plain":
    case "quoteDouble":
    case "quoteSingle":
      return node.position.start.line === node.position.end.line;
    case "alias":
      return true;
    default:
      return false;
  }
}

function isAbsolutelyPrintedAsSingleLineNode(node, options) {
  switch (node.type) {
    case "plain":
    case "quoteSingle":
    case "quoteDouble":
      break;
    case "alias":
      return true;
    default:
      return false;
  }

  if (options.proseWrap === "preserve") {
    return node.position.start.line === node.position.end.line;
  }

  if (
    // backslash-newline
    /\\$/m.test(
      options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset
      )
    )
  ) {
    return false;
  }

  switch (options.proseWrap) {
    case "never":
      return node.value.indexOf("\n") === -1;
    case "always":
      return !/[\n ]/.test(node.value);
    // istanbul ignore next
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

function printFlowScalarContent(nodeType, content, options) {
  const lineContents = getFlowScalarLineContents(nodeType, content, options);
  return join(
    hardline,
    lineContents.map(lineContentWords =>
      fill(join(line, lineContentWords).parts)
    )
  );
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
      case "quoteDouble":
      case "quoteSingle":
        newNode.type = "quote";
        break;
    }
  }
}

module.exports = {
  print: genericPrint,
  massageAstNode: clean,
  insertPragma
};
