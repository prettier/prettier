import { stripTrailingHardline } from "../document/utils.js";
import { normalize } from "./options.js";
import { ensureAllCommentsPrinted, attach } from "./comments.js";
import { parse } from "./parser.js";

async function printEmbeddedLanguages(
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

  const pathStacks = [];

  recurse();

  const originalPathStack = path.stack;

  for (const { pathStack, embeddedLanguage } of pathStacks) {
    try {
      path.stack = pathStack;
      const result = printer.embed(
        path,
        print,
        textToDocForEmbed,
        options,
        embeddedLanguage
      );
      if (result) {
        const doc = result.then ? await result : result;
        if (doc) {
          embeds.set(path.getValue(), doc);
        }
      }
    } catch (error) {
      /* istanbul ignore if */
      if (process.env.PRETTIER_DEBUG) {
        throw error;
      }
    }
  }

  path.stack = originalPathStack;

  function textToDocForEmbed(text, partialNextOptions, textToDocOptions) {
    return textToDoc(
      text,
      partialNextOptions,
      options,
      printAstToDoc,
      textToDocOptions
    );
  }

  function recurse() {
    const node = path.getValue();

    if (
      // TODO: improve this check
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
      if (key === "tokens" || key === "comments" || key === "parent") {
        continue;
      }
      if (Array.isArray(value)) {
        path.each(recurse, key);
      } else {
        path.call(recurse, key);
      }
    }

    let embeddedLanguage;
    if (printer.detectEmbeddedLanguage) {
      embeddedLanguage = printer.detectEmbeddedLanguage(path, options);
      if (!embeddedLanguage) {
        return;
      }
    }

    pathStacks.push({ pathStack: [...path.stack], embeddedLanguage });
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
