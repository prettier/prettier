"use strict";

const { printComments, printDanglingComments } = require("../../main/comments");
const {
  builders: { concat, join, line, hardline, softline, group, indent, ifBreak },
} = require("../../document");
const {
  hasComment,
  Comment,
  hasNewlineBetweenOrAfterDecorators,
} = require("../utils");
const { getTypeParametersGroupId } = require("./type-parameters");
const { printMethod } = require("./function");
const { printOptionalToken } = require("./misc");
const { printStatementSequence } = require("./statement");
const { printPropertyKey } = require("./property");
const { printTypeAnnotation } = require("./type-annotation");
const { printAssignmentRight } = require("./assignment");

function printClass(path, options, print) {
  const n = path.getValue();
  const parts = [];

  if (n.declare) {
    parts.push("declare ");
  }

  if (n.abstract) {
    parts.push("abstract ");
  }

  parts.push("class");

  // Keep old behaviour of extends in same line
  // If there is only on extends and there are not comments
  const groupMode =
    (n.id && hasComment(n.id, Comment.trailing)) ||
    (n.superClass && hasComment(n.superClass)) ||
    (n.extends && n.extends.length !== 0) || // DeclareClass
    (n.mixins && n.mixins.length !== 0) ||
    (n.implements && n.implements.length !== 0);

  const partsGroup = [];
  const extendsParts = [];

  if (n.id) {
    partsGroup.push(" ", path.call(print, "id"));
  }

  partsGroup.push(path.call(print, "typeParameters"));

  if (n.superClass) {
    const printed = concat([
      "extends ",
      printSuperClass(path, options, print),
      path.call(print, "superTypeParameters"),
    ]);
    const printedWithComments = path.call(
      (superClass) => printComments(superClass, () => printed, options),
      "superClass"
    );
    if (groupMode) {
      extendsParts.push(line, group(printedWithComments));
    } else {
      extendsParts.push(" ", printedWithComments);
    }
  } else {
    extendsParts.push(printList(path, options, print, "extends"));
  }

  extendsParts.push(printList(path, options, print, "mixins"));
  extendsParts.push(printList(path, options, print, "implements"));

  if (groupMode) {
    const printedExtends = concat(extendsParts);
    if (shouldIndentOnlyHeritageClauses(n)) {
      parts.push(
        group(
          concat(
            partsGroup.concat(ifBreak(indent(printedExtends), printedExtends))
          )
        )
      );
    } else {
      parts.push(group(indent(concat(partsGroup.concat(printedExtends)))));
    }
  } else {
    parts.push(...partsGroup, ...extendsParts);
  }

  parts.push(" ", path.call(print, "body"));

  return concat(parts);
}

function hasMultipleHeritage(node) {
  return (
    ["superClass", "extends", "mixins", "implements"].filter(
      (key) => !!node[key]
    ).length > 1
  );
}

function shouldIndentOnlyHeritageClauses(node) {
  return (
    node.typeParameters &&
    !hasComment(node.typeParameters, Comment.trailing | Comment.line) &&
    !hasMultipleHeritage(node)
  );
}

function printList(path, options, print, listName) {
  const n = path.getValue();
  if (!n[listName] || n[listName].length === 0) {
    return "";
  }

  const printedLeadingComments = printDanglingComments(
    path,
    options,
    /* sameIndent */ true,
    ({ marker }) => marker === listName
  );
  return concat([
    shouldIndentOnlyHeritageClauses(n)
      ? ifBreak(" ", line, {
          groupId: getTypeParametersGroupId(n.typeParameters),
        })
      : line,
    printedLeadingComments,
    printedLeadingComments && hardline,
    listName,
    group(
      indent(
        concat([line, join(concat([",", line]), path.map(print, listName))])
      )
    ),
  ]);
}

function printSuperClass(path, options, print) {
  const printed = path.call(print, "superClass");
  const parent = path.getParentNode();
  if (parent.type === "AssignmentExpression") {
    return group(
      ifBreak(
        concat(["(", indent(concat([softline, printed])), softline, ")"]),
        printed
      )
    );
  }
  return printed;
}

function printClassMethod(path, options, print) {
  const n = path.getValue();
  const parts = [];

  if (n.decorators && n.decorators.length !== 0) {
    parts.push(printDecorators(path, options, print));
  }
  if (n.accessibility) {
    parts.push(n.accessibility + " ");
  }
  if (n.static) {
    parts.push("static ");
  }
  if (n.type === "TSAbstractMethodDefinition" || n.abstract) {
    parts.push("abstract ");
  }

  parts.push(printMethod(path, options, print));

  return concat(parts);
}

function printClassBody(path, options, print) {
  const n = path.getValue();
  if (!hasComment(n) && n.body.length === 0) {
    return "{}";
  }

  return concat([
    "{",
    n.body.length > 0
      ? indent(
          concat([
            hardline,
            path.call((bodyPath) => {
              return printStatementSequence(bodyPath, options, print);
            }, "body"),
          ])
        )
      : printDanglingComments(path, options),
    hardline,
    "}",
  ]);
}

function printClassProperty(path, options, print) {
  const n = path.getValue();
  const parts = [];
  const semi = options.semi ? ";" : "";

  if (n.decorators && n.decorators.length !== 0) {
    parts.push(printDecorators(path, options, print));
  }
  if (n.accessibility) {
    parts.push(n.accessibility + " ");
  }
  if (n.declare) {
    parts.push("declare ");
  }
  if (n.static) {
    parts.push("static ");
  }
  if (n.type === "TSAbstractClassProperty" || n.abstract) {
    parts.push("abstract ");
  }
  if (n.readonly) {
    parts.push("readonly ");
  }
  if (n.variance) {
    parts.push(path.call(print, "variance"));
  }
  parts.push(
    printPropertyKey(path, options, print),
    printOptionalToken(path),
    printTypeAnnotation(path, options, print)
  );
  if (n.value) {
    parts.push(
      " =",
      printAssignmentRight(n.key, n.value, path.call(print, "value"), options)
    );
  }

  parts.push(semi);

  return group(concat(parts));
}

function printDecorators(path, options, print) {
  const node = path.getValue();
  return group(
    concat([
      join(line, path.map(print, "decorators")),
      hasNewlineBetweenOrAfterDecorators(node, options) ? hardline : line,
    ])
  );
}

module.exports = {
  printClass,
  printClassMethod,
  printClassBody,
  printClassProperty,
};
