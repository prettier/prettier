import { stripTrailingHardline } from "../document/utils.js";
import { normalize } from "./options.js";
import { ensureAllCommentsPrinted, attach } from "./comments.js";
import { parse } from "./parser.js";
import createGetVisitorKeysFunction from "./create-get-visitor-keys-function.js";

async function printEmbeddedLanguages(
  /** @type {import("../common/ast-path").default} */ path,
  genericPrint,
  options,
  printAstToDoc,
  embeds
) {
  const {
    embeddedLanguageFormatting,
    printer: {
      embed,
      hasPrettierIgnore = () => false,
      getVisitorKeys: printerGetVisitorKeys,
    },
  } = options;

  if (!embed || embeddedLanguageFormatting !== "auto") {
    return;
  }

  if (embed.length > 2) {
    throw new Error(
      "printer.embed has too many parameters. The API changed in Prettier v3. Please update your plugin. See https://prettier.io/docs/en/plugins.html#optional-embed"
    );
  }

  const getVisitorKeys = createGetVisitorKeysFunction(
    embed.getVisitorKeys ?? printerGetVisitorKeys
  );
  const embedCallResults = [];

  recurse();

  const originalPathStack = path.stack;

  for (const { print, node, pathStack } of embedCallResults) {
    try {
      path.stack = pathStack;
      const doc = await print(textToDocForEmbed, genericPrint, path, options);

      if (doc) {
        embeds.set(node, doc);
      }
    } catch (error) {
      /* istanbul ignore if */
      if (process.env.PRETTIER_DEBUG) {
        throw error;
      }
    }
  }

  path.stack = originalPathStack;

  function textToDocForEmbed(text, partialNextOptions) {
    return textToDoc(text, partialNextOptions, options, printAstToDoc);
  }

  function recurse() {
    const node = path.getValue();
    if (node === null || typeof node !== "object" || hasPrettierIgnore(path)) {
      return;
    }

    for (const key of getVisitorKeys(node)) {
      if (Array.isArray(node[key])) {
        path.each(recurse, key);
      } else {
        path.call(recurse, key);
      }
    }

    const result = embed(path, options);

    if (!result) {
      return;
    }

    if (typeof result === "function") {
      embedCallResults.push({
        print: result,
        node,
        pathStack: [...path.stack],
      });
      return;
    }

    if (
      process.env.NODE_ENV !== "production" &&
      typeof result.then === "function"
    ) {
      throw new Error(
        "`embed` should return an async function instead of Promise."
      );
    }

    embeds.set(node, result);
  }
}

async function textToDoc(
  text,
  partialNextOptions,
  parentOptions,
  printAstToDoc
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

  return stripTrailingHardline(doc);
}

export { printEmbeddedLanguages };
