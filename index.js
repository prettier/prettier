"use strict";

const path = require('path');
const fs = require('fs');
const ini = require('ini');
const codeFrame = require("babel-code-frame");
const comments = require("./src/comments");
const version = require("./package.json").version;
const printAstToDoc = require("./src/printer").printAstToDoc;
const printDocToString = require("./src/doc-printer").printDocToString;
const normalizeOptions = require("./src/options").normalize;
const parser = require("./src/parser");
const printDocToDebug = require("./src/doc-debug").printDocToDebug;

function guessLineEnding(text) {
  const index = text.indexOf("\n");
  if (index >= 0 && text.charAt(index - 1) === "\r") {
    return "\r\n";
  }
  return "\n";
}

function parse(text, opts) {
  let parseFunction;

  if (opts.parser === "flow") {
    parseFunction = parser.parseWithFlow;
  } else if (opts.parser === "typescript") {
    parseFunction = parser.parseWithTypeScript;
  } else {
    parseFunction = parser.parseWithBabylon;
  }

  try {
    return parseFunction(text);
  } catch (error) {
    const loc = error.loc;

    if (loc) {
      error.codeFrame = codeFrame(text, loc.line, loc.column + 1, {
        highlightCode: true
      });
      error.message += "\n" + error.codeFrame;
    }

    throw error;
  }
}

function attachComments(text, ast, opts) {
  const astComments = ast.comments;
  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text, opts);
  }
  ast.tokens = [];
  opts.originalText = text.trimRight();
  return astComments;
}

function ensureAllCommentsPrinted(astComments) {
  for (let i = 0; i < astComments.length; ++i) {
    if (astComments[i].value.trim() === "prettier-ignore") {
      // If there's a prettier-ignore, we're not printing that sub-tree so we
      // don't know if the comments was printed or not.
      return;
    }
  }

  astComments.forEach(comment => {
    if (!comment.printed) {
      throw new Error(
        'Comment "' +
          comment.value.trim() +
          '" was not printed. Please report this error!'
      );
    }
    delete comment.printed;
  });
}

function format(text, opts) {
  const ast = parse(text, opts);
  const astComments = attachComments(text, ast, opts);
  const doc = printAstToDoc(ast, opts);
  opts.newLine = guessLineEnding(text);
  const str = printDocToString(doc, opts);
  ensureAllCommentsPrinted(astComments);
  return str;
}

function formatWithShebang(text, opts) {
  if (!text.startsWith("#!")) {
    return format(text, opts);
  }

  const index = text.indexOf("\n");
  const shebang = text.slice(0, index + 1);
  const programText = text.slice(index + 1);
  const nextChar = text.charAt(index + 1);
  const newLine = nextChar === "\n" ? "\n" : nextChar === "\r" ? "\r\n" : "";

  return shebang + newLine + format(programText, opts);
}

function hasEditorConfig() {
  const file = path.resolve(process.cwd(), ".editorconfig");
  return fs.existsSync(file);
}

function getEditorConfig() {
  const file = path.resolve(process.cwd(), ".editorconfig");
  const ecData = fs.readFileSync(file, "utf8");
  return ini.parse(ecData);
}

function init() {
  const file = path.resolve(process.cwd(), "package.json");
  const data = fs.readFileSync(file, "utf8");
  try {
    const opts = {};
    const pkg = JSON.parse(data);

    // parses editorconfig if available
    if (hasEditorConfig()) {
      const ec = getEditorConfig();

      const matched = ec['*'];

      if (matched) {
        opts.tabWidth = matched.indent_size;
        if (matched.indent_style) {
          opts.useTabs = matched.indent_style === 'tab';
        }
      }
    }

    // parses the command
    pkg.scripts.prettier = "prettier" + 
    " --write" +
    (opts.useTabs ? " --use-tabs" : "") +
    (opts.tabWidth ? " --tab-width " + opts.tabWidth : "") +
    " '{**/*.js}'";

    fs.writeFileSync(file, JSON.stringify(pkg, null, "  "));
    return Promise.resolve(true);
  } catch (err) {
    return Promise.reject(err);
  }
}

module.exports = {
  format: function(text, opts) {
    return formatWithShebang(text, normalizeOptions(opts));
  },
  check: function(text, opts) {
    try {
      const formatted = this.format(text, opts);
      return formatted === text;
    } catch (e) {
      return false;
    }
  },
  init: init,
  version: version,
  __debug: {
    formatAST: function(ast, opts) {
      opts = normalizeOptions(opts);
      const doc = printAstToDoc(ast, opts);
      const str = printDocToString(doc, opts);
      return str;
    },
    // Doesn't handle shebang for now
    formatDoc: function(doc, opts) {
      opts = normalizeOptions(opts);
      const debug = printDocToDebug(doc);
      const str = format(debug, opts);
      return str;
    },
    printToDoc: function(text, opts) {
      opts = normalizeOptions(opts);
      const ast = parse(text, opts);
      attachComments(text, ast, opts);
      const doc = printAstToDoc(ast, opts);
      return doc;
    },
    printDocToString: function(doc, opts) {
      opts = normalizeOptions(opts);
      const str = printDocToString(doc, opts);
      return str;
    }
  }
};
