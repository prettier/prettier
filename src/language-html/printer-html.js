"use strict";

const clean = require("./clean");
const {
  builders,
  utils: { stripTrailingHardline, mapDoc }
} = require("../doc");
const {
  breakParent,
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  literalline,
  markAsRoot,
  softline
} = builders;
const {
  countParents,
  dedentString,
  forceBreakChildren,
  forceBreakContent,
  forceNextEmptyLine,
  getCommentData,
  getLastDescendant,
  getPrettierIgnoreAttributeCommentData,
  hasPrettierIgnore,
  inferScriptParser,
  isPreLikeNode,
  isScriptLikeTag,
  normalizeParts,
  preferHardlineAsLeadingSpaces,
  replaceDocNewlines,
  replaceNewlines,
  shouldNotPrintClosingTag,
  shouldPreserveContent
} = require("./utils");
const preprocess = require("./preprocess");
const assert = require("assert");
const { insertPragma } = require("./pragma");
const { printVueFor, printVueSlotScope } = require("./syntax-vue");
const { printImgSrcset } = require("./syntax-attribute");

function concat(parts) {
  const newParts = normalizeParts(parts);
  return newParts.length === 0
    ? ""
    : newParts.length === 1
    ? newParts[0]
    : builders.concat(newParts);
}

function embed(path, print, textToDoc, options) {
  const node = path.getValue();
  switch (node.type) {
    case "text": {
      if (isScriptLikeTag(node.parent)) {
        const parser = inferScriptParser(node.parent);
        if (parser) {
          const value =
            parser === "markdown"
              ? dedentString(node.value.replace(/^[^\S\n]*?\n/, ""))
              : node.value;
          return builders.concat([
            concat([
              breakParent,
              printOpeningTagPrefix(node),
              markAsRoot(stripTrailingHardline(textToDoc(value, { parser }))),
              printClosingTagSuffix(node)
            ])
          ]);
        }
      } else if (node.parent.type === "interpolation") {
        return concat([
          indent(
            concat([
              line,
              textToDoc(
                node.value,
                options.parser === "angular"
                  ? { parser: "__ng_interpolation", trailingComma: "none" }
                  : options.parser === "vue"
                  ? { parser: "__vue_expression" }
                  : { parser: "__js_expression" }
              )
            ])
          ),
          node.parent.next &&
          needsToBorrowPrevClosingTagEndMarker(node.parent.next)
            ? " "
            : line
        ]);
      }
      break;
    }
    case "attribute": {
      if (!node.value) {
        break;
      }

      const embeddedAttributeValueDoc = printEmbeddedAttributeValue(
        node,
        (code, opts) =>
          // strictly prefer single quote to avoid unnecessary html entity escape
          textToDoc(code, Object.assign({ __isInHtmlAttribute: true }, opts)),
        options
      );
      if (embeddedAttributeValueDoc) {
        return concat([
          node.rawName,
          '="',
          mapDoc(embeddedAttributeValueDoc, doc =>
            typeof doc === "string" ? doc.replace(/"/g, "&quot;") : doc
          ),
          '"'
        ]);
      }
      break;
    }
    case "yaml":
      return markAsRoot(
        concat([
          "---",
          hardline,
          node.value.trim().length === 0
            ? ""
            : replaceDocNewlines(
                textToDoc(node.value, { parser: "yaml" }),
                literalline
              ),
          "---"
        ])
      );
  }
}

function genericPrint(path, options, print) {
  const node = path.getValue();
  switch (node.type) {
    case "root":
      // use original concat to not break stripTrailingHardline
      return builders.concat([
        group(printChildren(path, options, print)),
        hardline
      ]);
    case "element":
    case "ieConditionalComment": {
      /**
       * do not break:
       *
       *     <div>{{
       *         ~
       *       interpolation
       *     }}</div>
       *            ~
       *
       * exception: break if the opening tag breaks
       *
       *     <div
       *       long
       *           ~
       *       >{{
       *         interpolation
       *       }}</div
       *              ~
       *     >
       */
      const shouldHugContent =
        node.children.length === 1 &&
        node.firstChild.type === "interpolation" &&
        (node.firstChild.isLeadingSpaceSensitive &&
          !node.firstChild.hasLeadingSpaces) &&
        (node.lastChild.isTrailingSpaceSensitive &&
          !node.lastChild.hasTrailingSpaces);
      const attrGroupId = Symbol("element-attr-group-id");
      return concat([
        group(
          concat([
            group(printOpeningTag(path, options, print), { id: attrGroupId }),
            node.children.length === 0
              ? node.hasDanglingSpaces && node.isDanglingSpaceSensitive
                ? line
                : ""
              : concat([
                  forceBreakContent(node) ? breakParent : "",
                  (childrenDoc =>
                    shouldHugContent
                      ? ifBreak(indent(childrenDoc), childrenDoc, {
                          groupId: attrGroupId
                        })
                      : isScriptLikeTag(node) &&
                        node.parent.type === "root" &&
                        options.parser === "vue"
                      ? childrenDoc
                      : indent(childrenDoc))(
                    concat([
                      shouldHugContent
                        ? ifBreak(softline, "", { groupId: attrGroupId })
                        : node.firstChild.type === "text" &&
                          node.firstChild.isWhitespaceSensitive &&
                          node.firstChild.isIndentationSensitive
                        ? (node.children.length === 1 &&
                            node.firstChild.type === "text" &&
                            node.firstChild.value.indexOf("\n") === -1) ||
                          node.firstChild.sourceSpan.start.line ===
                            node.lastChild.sourceSpan.end.line
                          ? ""
                          : literalline
                        : node.firstChild.hasLeadingSpaces &&
                          node.firstChild.isLeadingSpaceSensitive
                        ? line
                        : softline,
                      printChildren(path, options, print)
                    ])
                  ),
                  (node.next
                  ? needsToBorrowPrevClosingTagEndMarker(node.next)
                  : needsToBorrowLastChildClosingTagEndMarker(node.parent))
                    ? node.lastChild.hasTrailingSpaces &&
                      node.lastChild.isTrailingSpaceSensitive
                      ? " "
                      : ""
                    : shouldHugContent
                    ? ifBreak(softline, "", { groupId: attrGroupId })
                    : node.lastChild.hasTrailingSpaces &&
                      node.lastChild.isTrailingSpaceSensitive
                    ? line
                    : node.type === "element" &&
                      isPreLikeNode(node) &&
                      node.lastChild.type === "text" &&
                      (node.lastChild.value.indexOf("\n") === -1 ||
                        new RegExp(
                          `\\n\\s{${options.tabWidth *
                            countParents(
                              path,
                              n => n.parent && n.parent.type !== "root"
                            )}}$`
                        ).test(node.lastChild.value))
                    ? /**
                       *     <div>
                       *       <pre>
                       *         something
                       *       </pre>
                       *            ~
                       *     </div>
                       */
                      ""
                    : softline
                ])
          ])
        ),
        printClosingTag(node)
      ]);
    }
    case "interpolation":
      return concat([
        printOpeningTagStart(node),
        concat(path.map(print, "children")),
        printClosingTagEnd(node)
      ]);
    case "text": {
      if (node.parent.type === "interpolation") {
        // replace the trailing literalline with hardline for better readability
        const trailingNewlineRegex = /\n[^\S\n]*?$/;
        const hasTrailingNewline = trailingNewlineRegex.test(node.value);
        const value = hasTrailingNewline
          ? node.value.replace(trailingNewlineRegex, "")
          : node.value;
        return concat([
          concat(replaceNewlines(value, literalline)),
          hasTrailingNewline ? hardline : ""
        ]);
      }
      return fill(
        normalizeParts(
          [].concat(
            printOpeningTagPrefix(node),
            getTextValueParts(node),
            printClosingTagSuffix(node)
          )
        )
      );
    }
    case "docType":
      return concat([
        group(
          concat([
            printOpeningTagStart(node),
            " ",
            node.value.replace(/^html\b/i, "html").replace(/\s+/g, " ")
          ])
        ),
        printClosingTagEnd(node)
      ]);
    case "comment": {
      const value = getCommentData(node);
      return concat([
        group(
          concat([
            printOpeningTagStart(node),
            value.trim().length === 0
              ? ""
              : concat([
                  indent(
                    concat([
                      node.prev &&
                      needsToBorrowNextOpeningTagStartMarker(node.prev)
                        ? breakParent
                        : "",
                      line,
                      concat(replaceNewlines(value, hardline))
                    ])
                  ),
                  (node.next
                  ? needsToBorrowPrevClosingTagEndMarker(node.next)
                  : needsToBorrowLastChildClosingTagEndMarker(node.parent))
                    ? " "
                    : line
                ])
          ])
        ),
        printClosingTagEnd(node)
      ]);
    }
    case "attribute":
      return concat([
        node.rawName,
        node.value === null
          ? ""
          : concat([
              '="',
              concat(
                replaceNewlines(node.value.replace(/"/g, "&quot;"), literalline)
              ),
              '"'
            ])
      ]);
    case "yaml":
    case "toml":
      return node.raw;
    default:
      throw new Error(`Unexpected node type ${node.type}`);
  }
}

function printChildren(path, options, print) {
  const node = path.getValue();

  if (forceBreakChildren(node)) {
    return concat([
      breakParent,
      concat(
        path.map(childPath => {
          const childNode = childPath.getValue();
          const prevBetweenLine = !childNode.prev
            ? ""
            : printBetweenLine(childNode.prev, childNode);
          return concat([
            !prevBetweenLine
              ? ""
              : concat([
                  prevBetweenLine,
                  forceNextEmptyLine(childNode.prev) ? hardline : ""
                ]),
            printChild(childPath)
          ]);
        }, "children")
      )
    ]);
  }

  const groupIds = node.children.map(() => Symbol(""));
  return concat(
    path.map((childPath, childIndex) => {
      const childNode = childPath.getValue();

      if (childNode.type === "text") {
        return printChild(childPath);
      }

      const prevParts = [];
      const leadingParts = [];
      const trailingParts = [];
      const nextParts = [];

      const prevBetweenLine = childNode.prev
        ? printBetweenLine(childNode.prev, childNode)
        : "";

      const nextBetweenLine = childNode.next
        ? printBetweenLine(childNode, childNode.next)
        : "";

      if (prevBetweenLine) {
        if (forceNextEmptyLine(childNode.prev)) {
          prevParts.push(hardline, hardline);
        } else if (prevBetweenLine === hardline) {
          prevParts.push(hardline);
        } else {
          if (childNode.prev.type === "text") {
            leadingParts.push(prevBetweenLine);
          } else {
            leadingParts.push(
              ifBreak("", softline, {
                groupId: groupIds[childIndex - 1]
              })
            );
          }
        }
      }

      if (nextBetweenLine) {
        if (forceNextEmptyLine(childNode)) {
          if (childNode.next.type === "text") {
            nextParts.push(hardline, hardline);
          }
        } else if (nextBetweenLine === hardline) {
          if (childNode.next.type === "text") {
            nextParts.push(hardline);
          }
        } else {
          trailingParts.push(nextBetweenLine);
        }
      }

      return concat(
        [].concat(
          prevParts,
          group(
            concat([
              concat(leadingParts),
              group(concat([printChild(childPath), concat(trailingParts)]), {
                id: groupIds[childIndex]
              })
            ])
          ),
          nextParts
        )
      );
    }, "children")
  );

  function printChild(childPath) {
    const child = childPath.getValue();

    if (hasPrettierIgnore(child)) {
      return concat(
        [].concat(
          printOpeningTagPrefix(child),
          replaceNewlines(
            options.originalText.slice(
              options.locStart(child) +
                (child.prev &&
                needsToBorrowNextOpeningTagStartMarker(child.prev)
                  ? printOpeningTagStartMarker(child).length
                  : 0),
              options.locEnd(child) -
                (child.next && needsToBorrowPrevClosingTagEndMarker(child.next)
                  ? printClosingTagEndMarker(child).length
                  : 0)
            ),
            literalline
          ),
          printClosingTagSuffix(child)
        )
      );
    }

    if (shouldPreserveContent(child)) {
      return concat(
        [].concat(
          printOpeningTagPrefix(child),
          group(printOpeningTag(childPath, options, print)),
          replaceNewlines(
            options.originalText.slice(
              child.startSourceSpan.end.offset -
                (child.firstChild &&
                needsToBorrowParentOpeningTagEndMarker(child.firstChild)
                  ? printOpeningTagEndMarker(child).length
                  : 0),
              child.endSourceSpan.start.offset +
                (child.lastChild &&
                needsToBorrowParentClosingTagStartMarker(child.lastChild)
                  ? printClosingTagStartMarker(child).length
                  : 0)
            ),
            literalline
          ),
          printClosingTag(child),
          printClosingTagSuffix(child)
        )
      );
    }

    return print(childPath);
  }

  function printBetweenLine(prevNode, nextNode) {
    return (needsToBorrowNextOpeningTagStartMarker(prevNode) &&
      /**
       *     123<a
       *          ~
       *       ><b>
       */
      (nextNode.firstChild ||
        /**
         *     123<!--
         *            ~
         *     -->
         */
        nextNode.isSelfClosing ||
        /**
         *     123<span
         *             ~
         *       attr
         */
        (nextNode.type === "element" && nextNode.attrs.length !== 0))) ||
      /**
       *     <img
       *       src="long"
       *                 ~
       *     />123
       */
      (prevNode.type === "element" &&
        prevNode.isSelfClosing &&
        needsToBorrowPrevClosingTagEndMarker(nextNode))
      ? ""
      : !nextNode.isLeadingSpaceSensitive ||
        preferHardlineAsLeadingSpaces(nextNode) ||
        /**
         *       Want to write us a letter? Use our<a
         *         ><b><a>mailing address</a></b></a
         *                                          ~
         *       >.
         */
        (needsToBorrowPrevClosingTagEndMarker(nextNode) &&
          prevNode.lastChild &&
          needsToBorrowParentClosingTagStartMarker(prevNode.lastChild) &&
          prevNode.lastChild.lastChild &&
          needsToBorrowParentClosingTagStartMarker(
            prevNode.lastChild.lastChild
          ))
      ? hardline
      : nextNode.hasLeadingSpaces
      ? line
      : softline;
  }
}

function printOpeningTag(path, options, print) {
  const node = path.getValue();
  const forceNotToBreakAttrContent =
    node.type === "element" &&
    node.fullName === "script" &&
    node.attrs.length === 1 &&
    node.attrs[0].fullName === "src" &&
    node.children.length === 0;
  return concat([
    printOpeningTagStart(node),
    !node.attrs || node.attrs.length === 0
      ? node.isSelfClosing
        ? /**
           *     <br />
           *        ^
           */
          " "
        : ""
      : concat([
          indent(
            concat([
              forceNotToBreakAttrContent ? " " : line,
              join(
                line,
                (ignoreAttributeData => {
                  const hasPrettierIgnoreAttribute =
                    typeof ignoreAttributeData === "boolean"
                      ? () => ignoreAttributeData
                      : Array.isArray(ignoreAttributeData)
                      ? attr => ignoreAttributeData.indexOf(attr.rawName) !== -1
                      : () => false;
                  return path.map(attrPath => {
                    const attr = attrPath.getValue();
                    return hasPrettierIgnoreAttribute(attr)
                      ? concat(
                          replaceNewlines(
                            options.originalText.slice(
                              options.locStart(attr),
                              options.locEnd(attr)
                            ),
                            literalline
                          )
                        )
                      : print(attrPath);
                  }, "attrs");
                })(
                  node.prev &&
                    node.prev.type === "comment" &&
                    getPrettierIgnoreAttributeCommentData(node.prev.value)
                )
              )
            ])
          ),
          /**
           *     123<a
           *       attr
           *           ~
           *       >456
           */
          (node.firstChild &&
            needsToBorrowParentOpeningTagEndMarker(node.firstChild)) ||
          /**
           *     <span
           *       >123<meta
           *                ~
           *     /></span>
           */
          (node.isSelfClosing &&
            needsToBorrowLastChildClosingTagEndMarker(node.parent))
            ? ""
            : node.isSelfClosing
            ? forceNotToBreakAttrContent
              ? " "
              : line
            : forceNotToBreakAttrContent
            ? ""
            : softline
        ]),
    node.isSelfClosing ? "" : printOpeningTagEnd(node)
  ]);
}

function printOpeningTagStart(node) {
  return node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
    ? ""
    : concat([printOpeningTagPrefix(node), printOpeningTagStartMarker(node)]);
}

function printOpeningTagEnd(node) {
  return node.firstChild &&
    needsToBorrowParentOpeningTagEndMarker(node.firstChild)
    ? ""
    : printOpeningTagEndMarker(node);
}

function printClosingTag(node) {
  return concat([
    node.isSelfClosing ? "" : printClosingTagStart(node),
    printClosingTagEnd(node)
  ]);
}

function printClosingTagStart(node) {
  return node.lastChild &&
    needsToBorrowParentClosingTagStartMarker(node.lastChild)
    ? ""
    : concat([printClosingTagPrefix(node), printClosingTagStartMarker(node)]);
}

function printClosingTagEnd(node) {
  return (node.next
  ? needsToBorrowPrevClosingTagEndMarker(node.next)
  : needsToBorrowLastChildClosingTagEndMarker(node.parent))
    ? ""
    : concat([printClosingTagEndMarker(node), printClosingTagSuffix(node)]);
}

function needsToBorrowNextOpeningTagStartMarker(node) {
  /**
   *     123<p
   *        ^^
   *     >
   */
  return (
    node.next &&
    node.type === "text" &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces
  );
}

function needsToBorrowParentOpeningTagEndMarker(node) {
  /**
   *     <p
   *       >123
   *       ^
   *
   *     <p
   *       ><a
   *       ^
   */
  return !node.prev && node.isLeadingSpaceSensitive && !node.hasLeadingSpaces;
}

function needsToBorrowPrevClosingTagEndMarker(node) {
  /**
   *     <p></p
   *     >123
   *     ^
   *
   *     <p></p
   *     ><a
   *     ^
   */
  return node.prev && node.isLeadingSpaceSensitive && !node.hasLeadingSpaces;
}

function needsToBorrowLastChildClosingTagEndMarker(node) {
  /**
   *     <p
   *       ><a></a
   *       ></p
   *       ^
   *     >
   */
  return (
    node.lastChild &&
    node.lastChild.isTrailingSpaceSensitive &&
    !node.lastChild.hasTrailingSpaces &&
    getLastDescendant(node.lastChild).type !== "text"
  );
}

function needsToBorrowParentClosingTagStartMarker(node) {
  /**
   *     <p>
   *       123</p
   *          ^^^
   *     >
   *
   *         123</b
   *       ></a
   *        ^^^
   *     >
   */
  return (
    !node.next &&
    !node.hasTrailingSpaces &&
    node.isTrailingSpaceSensitive &&
    getLastDescendant(node).type === "text"
  );
}

function printOpeningTagPrefix(node) {
  return needsToBorrowParentOpeningTagEndMarker(node)
    ? printOpeningTagEndMarker(node.parent)
    : needsToBorrowPrevClosingTagEndMarker(node)
    ? printClosingTagEndMarker(node.prev)
    : "";
}

function printClosingTagPrefix(node) {
  return needsToBorrowLastChildClosingTagEndMarker(node)
    ? printClosingTagEndMarker(node.lastChild)
    : "";
}

function printClosingTagSuffix(node) {
  return needsToBorrowParentClosingTagStartMarker(node)
    ? printClosingTagStartMarker(node.parent)
    : needsToBorrowNextOpeningTagStartMarker(node)
    ? printOpeningTagStartMarker(node.next)
    : "";
}

function printOpeningTagStartMarker(node) {
  switch (node.type) {
    case "comment":
      return "<!--";
    case "ieConditionalComment":
      return `<!--[if ${node.condition}`;
    case "interpolation":
      return "{{";
    case "docType":
      return "<!DOCTYPE";
    default:
      return `<${node.rawName}`;
  }
}

function printOpeningTagEndMarker(node) {
  assert(!node.isSelfClosing);
  switch (node.type) {
    case "ieConditionalComment":
      return "]>";
    default:
      return `>`;
  }
}

function printClosingTagStartMarker(node) {
  assert(!node.isSelfClosing);
  if (shouldNotPrintClosingTag(node)) {
    return "";
  }
  switch (node.type) {
    case "ieConditionalComment":
      return "<!";
    default:
      return `</${node.rawName}`;
  }
}

function printClosingTagEndMarker(node) {
  if (shouldNotPrintClosingTag(node)) {
    return "";
  }
  switch (node.type) {
    case "comment":
      return "-->";
    case "ieConditionalComment":
      return `[endif]-->`;
    case "interpolation":
      return "}}";
    case "element":
      if (node.isSelfClosing) {
        return "/>";
      }
    // fall through
    default:
      return ">";
  }
}

function getTextValueParts(node, value = node.value) {
  return node.isWhitespaceSensitive
    ? node.isIndentationSensitive
      ? replaceNewlines(value, literalline)
      : replaceNewlines(
          dedentString(value.replace(/^\s*?\n|\n\s*?$/g, "")),
          hardline
        )
    : // non-breaking whitespace: 0xA0
      join(line, value.split(/[^\S\xA0]+/)).parts;
}

function printEmbeddedAttributeValue(node, originalTextToDoc, options) {
  const isKeyMatched = patterns =>
    new RegExp(patterns.join("|")).test(node.fullName);
  const getValue = () =>
    node.value.replace(/&quot;/g, '"').replace(/&apos;/g, "'");

  let shouldHug = false;

  const __onHtmlBindingRoot = root => {
    const rootNode =
      root.type === "NGRoot"
        ? root.node.type === "NGMicrosyntax" &&
          root.node.body.length === 1 &&
          root.node.body[0].type === "NGMicrosyntaxExpression"
          ? root.node.body[0].expression
          : root.node
        : root.type === "JsExpressionRoot"
        ? root.node
        : root;
    if (
      rootNode &&
      (rootNode.type === "ObjectExpression" ||
        rootNode.type === "ArrayExpression")
    ) {
      shouldHug = true;
    }
  };

  const printHug = doc => group(doc);
  const printExpand = doc =>
    group(concat([indent(concat([softline, doc])), softline]));
  const printMaybeHug = doc => (shouldHug ? printHug(doc) : printExpand(doc));

  const textToDoc = (code, opts) =>
    originalTextToDoc(code, Object.assign({ __onHtmlBindingRoot }, opts));

  if (
    node.fullName === "srcset" &&
    (node.parent.fullName === "img" || node.parent.fullName === "source")
  ) {
    return printExpand(printImgSrcset(getValue()));
  }

  if (options.parser === "vue") {
    if (node.fullName === "v-for") {
      return printVueFor(getValue(), textToDoc);
    }

    if (node.fullName === "slot-scope") {
      return printVueSlotScope(getValue(), textToDoc);
    }

    /**
     *     @click="jsStatement"
     *     @click="jsExpression"
     *     v-on:click="jsStatement"
     *     v-on:click="jsExpression"
     */
    const vueEventBindingPatterns = ["^@", "^v-on:"];
    /**
     *     :class="vueExpression"
     *     v-bind:id="vueExpression"
     */
    const vueExpressionBindingPatterns = ["^:", "^v-bind:"];
    /**
     *     v-if="jsExpression"
     */
    const jsExpressionBindingPatterns = ["^v-"];

    if (isKeyMatched(vueEventBindingPatterns)) {
      // copied from https://github.com/vuejs/vue/blob/v2.5.17/src/compiler/codegen/events.js#L3-L4
      const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
      const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

      const value = getValue()
        // https://github.com/vuejs/vue/blob/v2.5.17/src/compiler/helpers.js#L104
        .trim();
      return printMaybeHug(
        simplePathRE.test(value) || fnExpRE.test(value)
          ? textToDoc(value, { parser: "__js_expression" })
          : stripTrailingHardline(textToDoc(value, { parser: "babylon" }))
      );
    }

    if (isKeyMatched(vueExpressionBindingPatterns)) {
      return printMaybeHug(
        textToDoc(getValue(), { parser: "__vue_expression" })
      );
    }

    if (isKeyMatched(jsExpressionBindingPatterns)) {
      return printMaybeHug(
        textToDoc(getValue(), { parser: "__js_expression" })
      );
    }
  }

  if (options.parser === "angular") {
    const ngTextToDoc = (code, opts) =>
      // angular does not allow trailing comma
      textToDoc(code, Object.assign({ trailingComma: "none" }, opts));

    /**
     *     *directive="angularDirective"
     */
    const ngDirectiveBindingPatterns = ["^\\*"];
    /**
     *     (click)="angularStatement"
     *     on-click="angularStatement"
     */
    const ngStatementBindingPatterns = ["^\\(.+\\)$", "^on-"];
    /**
     *     [target]="angularExpression"
     *     bind-target="angularExpression"
     *     [(target)]="angularExpression"
     *     bindon-target="angularExpression"
     */
    const ngExpressionBindingPatterns = ["^\\[.+\\]$", "^bind(on)?-"];

    if (isKeyMatched(ngStatementBindingPatterns)) {
      return printMaybeHug(ngTextToDoc(getValue(), { parser: "__ng_action" }));
    }

    if (isKeyMatched(ngExpressionBindingPatterns)) {
      return printMaybeHug(ngTextToDoc(getValue(), { parser: "__ng_binding" }));
    }

    if (isKeyMatched(ngDirectiveBindingPatterns)) {
      return printMaybeHug(
        ngTextToDoc(getValue(), { parser: "__ng_directive" })
      );
    }
  }

  return null;
}

module.exports = {
  preprocess,
  print: genericPrint,
  insertPragma,
  massageAstNode: clean,
  embed
};
