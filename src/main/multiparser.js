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

  const isNode =
    (printer.isNode ?? printer.canAttachComment)?.bind(printer) ?? (() => true);
  const hasPrettierIgnore =
    printer.hasPrettierIgnore?.bind(printer) ?? (() => false);
  const { ignoredProperties } = printer.massageAstNode;

  const pathStacks = [];

  recurse();

  const originalPathStack = path.stack;

  for (let { pathStack, node, result } of pathStacks) {
    try {
      if (typeof result === "function") {
        path.stack = pathStack;
        result = await result();
      }

      if (result) {
        embeds.set(node, result);
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
      node === null ||
      typeof node !== "object" ||
      !isNode(node) ||
      hasPrettierIgnore(path)
    ) {
      return;
    }

    for (const key in node) {
      if (
        Object.prototype.hasOwnProperty.call(node, key) &&
        !ignoredProperties?.has(key)
      ) {
        if (Array.isArray(node[key])) {
          path.each(recurse, key);
        } else {
          path.call(recurse, key);
        }
      }
    }

    const result = printer.embed(
      path,
      print,
      textToDocForEmbed,
      options,
    );
    if (result) {
      const node = path.getValue();
      if (typeof result === "function") {
        pathStacks.push({ pathStack: [...path.stack], node, result });
      } else if (typeof result.then === "function") {
        throw new TypeError("`embed` should return an async function instead of Promise.")
      } else {
        pathStacks.push({ node, result });
      }
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
