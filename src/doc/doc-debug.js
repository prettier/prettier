"use strict";

function flattenDoc(doc) {
  if (doc.type === "concat") {
    const res = [];

    for (let i = 0; i < doc.parts.length; ++i) {
      const doc2 = doc.parts[i];
      if (typeof doc2 !== "string" && doc2.type === "concat") {
        [].push.apply(res, flattenDoc(doc2).parts);
      } else {
        const flattened = flattenDoc(doc2);
        if (flattened !== "") {
          res.push(flattened);
        }
      }
    }

    return Object.assign({}, doc, { parts: res });
  } else if (doc.type === "if-break") {
    return Object.assign({}, doc, {
      breakContents:
        doc.breakContents != null ? flattenDoc(doc.breakContents) : null,
      flatContents:
        doc.flatContents != null ? flattenDoc(doc.flatContents) : null
    });
  } else if (doc.type === "group") {
    return Object.assign({}, doc, {
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates
        ? doc.expandedStates.map(flattenDoc)
        : doc.expandedStates
    });
  } else if (doc.contents) {
    return Object.assign({}, doc, { contents: flattenDoc(doc.contents) });
  }
  return doc;
}

function printDoc(doc) {
  if (typeof doc === "string") {
    return JSON.stringify(doc);
  }

  if (doc.type === "line") {
    if (doc.literalline) {
      return "literalline";
    }
    if (doc.hard) {
      return "hardline";
    }
    if (doc.soft) {
      return "softline";
    }
    return "line";
  }

  if (doc.type === "break-parent") {
    return "breakParent";
  }

  if (doc.type === "concat") {
    return "[" + doc.parts.map(printDoc).join(", ") + "]";
  }

  if (doc.type === "indent") {
    return "indent(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "align") {
    return doc.n === -Infinity
      ? "dedentToRoot(" + printDoc(doc.contents) + ")"
      : doc.n < 0
        ? "dedent(" + printDoc(doc.contents) + ")"
        : doc.n.type === "root"
          ? "markAsRoot(" + printDoc(doc.contents) + ")"
          : "align(" +
            JSON.stringify(doc.n) +
            ", " +
            printDoc(doc.contents) +
            ")";
  }

  if (doc.type === "if-break") {
    return (
      "ifBreak(" +
      printDoc(doc.breakContents) +
      (doc.flatContents ? ", " + printDoc(doc.flatContents) : "") +
      ")"
    );
  }

  if (doc.type === "group") {
    if (doc.expandedStates) {
      return (
        "conditionalGroup(" +
        "[" +
        doc.expandedStates.map(printDoc).join(",") +
        "])"
      );
    }

    return (
      (doc.break ? "wrappedGroup" : "group") +
      "(" +
      printDoc(doc.contents) +
      ")"
    );
  }

  if (doc.type === "fill") {
    return "fill" + "(" + doc.parts.map(printDoc).join(", ") + ")";
  }

  if (doc.type === "line-suffix") {
    return "lineSuffix(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "line-suffix-boundary") {
    return "lineSuffixBoundary";
  }

  throw new Error("Unknown doc type " + doc.type);
}

function printTag(tagName, props, contents) {
  if (!Array.isArray(contents)) {
    contents = [contents];
  }

  contents = contents
    .map(doc => printDocToJSX(doc, true))
    .join("\n");

  return (
    "<" +
    tagName +
    (props && props.length ? " " + props.replace(/\n/g, "\n  ") : "") +
    (contents && contents.length
      ? ">\n  " + contents.replace(/\n/g, "\n  ") + "\n</" + tagName + ">"
      : " />")
  );
}

function printDocToJSX(doc, inJSX) {
  if (typeof doc === "string") {
    if (!inJSX) {
      return JSON.stringify(doc);
    }
    if (/[{}<>]/.test(doc)) {
      return '{"' + doc + '"}';
    }
    return doc;
  }
  if (typeof doc === "number") {
    return String(doc);
  }
  if (doc == null) {
    return "";
  }

  if (doc.type === "line") {
    let props = "";
    if (doc.literalline) {
      props = "literal";
    }
    if (doc.hard) {
      props = "hard";
    }
    if (doc.soft) {
      props = "soft";
    }
    return printTag("line", props);
  }

  if (doc.type === "break-parent") {
    return printTag("break-parent");
  }

  if (doc.type === "concat") {
    return printTag("concat", "", doc.parts);
  }

  if (doc.type === "indent") {
    return printTag("indent", "", doc.contents);
  }

  if (doc.type === "align") {
    let tag = "align";
    let props = "";
    if (doc.n === -Infinity) {
      tag = "dedent";
      props = "root";
    } else if (doc.n < 0) {
      tag = "dedent";
      props = "width={" + printDocToJSX(doc.n) + "}";
    } else if (doc.n.type === "root") {
      tag = "mark-as-root";
    } else {
      props = "width={" + printDocToJSX(doc.n) + "}";
    }
    return printTag(tag, props, doc.contents);
  }

  if (doc.type === "if-break") {
    return printTag(
      "if-break",
      doc.flatContents && "flat={" + printDocToJSX(doc.flatContents) + "}",
      doc.breakContents
    );
  }

  if (doc.type === "group") {
    if (doc.expandedStates) {
      return printTag(
        "conditional-group",
        "states=[" +
          doc.expandedStates
            .map(doc => printDocToJSX(doc))
            .join(",\n  ") +
          "]"
      );
    }

    return printTag("group", doc.break && "wrapped", doc.contents);
  }

  if (doc.type === "fill") {
    return printTag("fill", "", doc.parts);
  }

  if (doc.type === "line-suffix") {
    return printTag("line-suffix", "", doc.contents);
  }

  if (doc.type === "line-suffix-boundary") {
    return printTag("line-suffix-boundary");
  }

  throw new Error("Unknown doc type " + doc.type);
}

module.exports = {
  printDocToDebug: function(doc) {
    return printDoc(flattenDoc(doc));
  },
  printJSXToDebug: function(doc) {
    return printDocToJSX(flattenDoc(doc));
  }
};
