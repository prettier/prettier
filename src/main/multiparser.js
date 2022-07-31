import { stripTrailingHardline } from "../document/utils.js";
import { normalize } from "./options.js";
import { ensureAllCommentsPrinted, attach } from "./comments.js";
import { parse } from "./parser.js";

function printEmbeddedLanguages(
  /** @type {import("../common/ast-path").default} */ path,
  print,
  options,
  printAstToDoc,
  embeds
) {
  const { printer } = options;

  if (!printer.embed || options.embeddedLanguageFormatting !== "auto") {
    return;
  }

  return recurse();

  function textToDocForEmbed(text, partialNextOptions, textToDocOptions) {
    return textToDoc(
      text,
      partialNextOptions,
      options,
      printAstToDoc,
      textToDocOptions
    );
  }

  async function recurse() {
    const name = path.getName();
    const node = path.getValue();

    if (
      // TODO: improve this check
      name === "tokens" ||
      name === "comments" ||
      name === "parent" ||
      node === null ||
      typeof node !== "object" ||
      (printer.isNode
        ? !printer.isNode(node)
        : printer.canAttachComment
        ? !printer.canAttachComment(node)
        : false) ||
      printer.hasPrettierIgnore?.(path)
    ) {
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          await path.callAsync(recurse, key, i);
        }
      } else {
        await path.callAsync(recurse, key);
      }
    }

    let doc;

    try {
      doc = await printer.embed(path, print, textToDocForEmbed, options);
    } catch (error) {
      /* istanbul ignore if */
      if (process.env.PRETTIER_DEBUG) {
        throw error;
      }
    }

    if (doc) {
      embeds.set(node, doc);
    }
  }
}

async function textToDoc(
  text,
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
      originalText: text,
    },
    { passThrough: true }
  );

  const result = await parse(text, nextOptions);
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

  const doc = await printAstToDoc(ast, nextOptions);
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

export { printEmbeddedLanguages };
