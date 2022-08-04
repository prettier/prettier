import { stripTrailingHardline } from "../document/utils.js";
import { normalize } from "./options.js";
import { ensureAllCommentsPrinted, attach } from "./comments.js";
import { parseSync } from "./parser.js";

function printSubtree(path, print, options, printAstToDoc) {
  if (options.printer.embed && options.embeddedLanguageFormatting === "auto") {
    return options.printer.embed(
      path,
      print,
      (text, partialNextOptions) =>
        textToDoc(text, partialNextOptions, options, printAstToDoc),
      options
    );
  }
}

function textToDoc(text, partialNextOptions, parentOptions, printAstToDoc) {
  const nextOptions = normalize(
    {
      ...parentOptions,
      ...partialNextOptions,
      parentParser: parentOptions.parser,
      originalText: text,
    },
    { passThrough: true }
  );

  const result = parseSync(text, nextOptions);
  const { ast } = result;

  if (typeof ast?.then === "function") {
    throw new TypeError("async parse is not supported in embed");
  }

  text = result.text;

  const astComments = ast.comments;
  delete ast.comments;
  attach(astComments, ast, text, nextOptions);
  // @ts-expect-error -- Casting to `unique symbol` isn't allowed in JSDoc comment
  nextOptions[Symbol.for("comments")] = astComments || [];
  // @ts-expect-error -- Casting to `unique symbol` isn't allowed in JSDoc comment
  nextOptions[Symbol.for("tokens")] = ast.tokens || [];

  const doc = printAstToDoc(ast, nextOptions);
  ensureAllCommentsPrinted(astComments);

  return stripTrailingHardline(doc);
}

export { printSubtree };
