"use strict";

var jsesc = require("jsesc");

function flattenDoc(doc) {
  if (!doc || 
      typeof doc === 'string' ||
      doc.type === 'line') {
    return doc;
  }

  if (doc.type === 'concat') {
    var res = [];
    for (var i = 0; i < doc.parts.length; ++i) {
      const doc2 = doc.parts[i];
      if (typeof doc2 !== 'string' && doc2.type === 'concat') {
        res.push(...doc2.parts.map(flattenDoc));
      } else {
        res.push(flattenDoc(doc2));
      }
    }
    return Object.assign({}, doc, {
      parts: res
    });
  }

  if (doc.type === 'indent') {
    return Object.assign({}, doc, {
      contents: flattenDoc(doc.contents)
    });
  }

  if (doc.type === 'if-break') {
    return Object.assign({}, doc, {
      breakContents: flattenDoc(doc.breakContents),
      flatContents: flattenDoc(doc.flatContents),
    });
  }

  if (doc.type === 'group') {
    return Object.assign({}, doc, {
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates ? doc.expandedStates.map(flattenDoc) : doc.expandedStates,
    });
  }
}

function printDoc(doc) {
  if (typeof doc === 'string') {
    return jsesc(doc, {wrap: true});
  }

  if (doc.type === 'line') {
    if (doc.literalline) {
      return 'literalline()';
    }
    if (doc.hard) {
      return 'hardline()';
    }
    if (doc.soft) {
      return 'softline()';
    }
    return 'line()';
  }

  if (doc.type === 'concat') {
    return "[" + doc.parts.map(printDoc).join(", ") + "]";
  }

  if (doc.type === 'indent') {
    return "indent(" + doc.n + ", " + printDoc(doc.contents) + ")";
  }

  if (doc.type === 'if-break') {
    if (doc.flatContents) {
      return 'break() ? ' + printDoc(doc.breakContents) + ' : ' + printDoc(doc.flatContents);
    }    
    return 'break() && ' + printDoc(doc.breakContents);
  }

  if (doc.type === 'group') {
    return "group" + (doc.break ? "Break" : "") +
      "(" + printDoc(doc.contents) +
      (doc.expandedStates ?
        ", [" + doc.expandedStates.map(printDoc).join(",") + "]" :
        "") +
      ")";
  }
}

module.exports = function(doc) {
  return printDoc(flattenDoc(doc));
};
