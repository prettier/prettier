import { stripTrailingHardline } from "../document/utils.js";
import { normalize } from "./options.js";
import { ensureAllCommentsPrinted, attach } from "./comments.js";
import { parse } from "./parser.js";

function printSubtree(path, print, options, printAstToDoc) {
  if (options.printer.embed && options.embeddedLanguageFormatting === "auto") {
    return options.printer.embed(
      path,
      print,
      (text, partialNextOptions, textToDocOptions) =>
        textToDoc(
          text,
          partialNextOptions,
          options,
          printAstToDoc,
          textToDocOptions
        ),
      options
    );
  }
}

async function textToDoc(
  originalText,
  partialNextOptions,
  parentOptions,
  printAstToDoc,
  // TODO: remove `stripTrailingHardline` in v3.0.0
  { stripTrailingHardline: shouldStripTrailingHardline = false } = {}
) {
  const nextOptions = normalize(
    {
      ...parentOptions,
      ...partialNextOptions,
      parentParser: parentOptions.parser,
      originalText,
    },
    { passThrough: true }
  );

  const { ast, text } = await parse(originalText, nextOptions);

  const astComments = ast.comments;
  delete ast.comments;
  attach(astComments, ast, text, nextOptions);
  // @ts-expect-error -- Casting to `unique symbol` isn't allowed in JSDoc comment
  nextOptions[Symbol.for("comments")] = astComments || [];
  // @ts-expect-error -- Casting to `unique symbol` isn't allowed in JSDoc comment
  nextOptions[Symbol.for("tokens")] = ast.tokens || [];

  const doc = printAstToDoc(ast, nextOptions);
  ensureAllCommentsPrinted(astComments);

  if (shouldStripTrailingHardline) {
    // TODO: move this to `stripTrailingHardline` function in `/src/document/utils.js`
    if (typeof doc === "string") {
      return doc.replace(/(?:\r?\n)*$/, "");
    }

    return stripTrailingHardline(doc);
  }

  /* istanbul ignore next */
  return doc;
}

export { printSubtree };
