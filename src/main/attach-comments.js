"use strict";

const comments = require("./comments.js");

function attachComments(text, ast, opts) {
  const astComments = ast.comments;
  const optsComments = opts[Symbol.for("comments")] || [];
  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text, opts);
    optsComments.push(...astComments);
  }

  opts[Symbol.for("comments")] = optsComments;
  opts[Symbol.for("tokens")] = ast.tokens || [];
  opts.originalText = text;
  return optsComments;
}

module.exports = attachComments;
