import path from "node:path";
import createEsmUtils from "esm-utils";
import { outdent } from "outdent";
import { FORMAT_TEST_DIRECTORY, FULL_TEST } from "./constants.js";

const { __filename } = createEsmUtils(import.meta);

const getCategory = (dirname) =>
  path.relative(FORMAT_TEST_DIRECTORY, dirname).split(path.sep).shift();

const categoryParsers = new Map([
  [
    "angular",
    {
      parsers: ["angular", "__ng_interpolation", "__ng_action"],
      verifyParsers: [],
      extensions: [".html", ".ng"],
    },
  ],
  [
    "css",
    { parsers: ["css"], verifyParsers: ["less", "scss"], extensions: [".css"] },
  ],
  [
    "flow",
    {
      parsers: ["flow", "babel-flow"],
      verifyParsers: [
        "flow",
        "babel-flow",
        "typescript",
        "babel-ts",
        "hermes",
        "babel",
      ],
      extensions: [".js", ".cjs", ".mjs", ".unknown"],
    },
  ],
  [
    "graphql",
    { parsers: ["graphql"], verifyParsers: [], extensions: [".graphql"] },
  ],
  [
    "handlebars",
    { parsers: ["glimmer"], verifyParsers: [], extensions: [".hbs"] },
  ],
  [
    "html",
    { parsers: ["html"], verifyParsers: [], extensions: [".html", ".svg"] },
  ],
  [
    "mjml",
    { parsers: ["mjml"], verifyParsers: ["html"], extensions: [".mjml"] },
  ],
  [
    "js",
    {
      parsers: ["babel", "acorn", "espree", "meriyah", "oxc"],
      verifyParsers: [
        "babel",
        "acorn",
        "espree",
        "meriyah",
        "oxc",
        "oxc-ts",
        "flow",
        "babel-flow",
        "typescript",
        "babel-ts",
        "hermes",
        "__babel_estree",
      ],
      extensions: [".js", ".cjs", ".mjs"],
    },
  ],
  [
    "json",
    {
      parsers: ["json", "json5", "jsonc", "json-stringify"],
      verifyParsers: ["json", "json5", "jsonc", "json-stringify"],
      extensions: [".json", ".json5", ".jsonc"],
    },
  ],
  [
    "jsx",
    {
      parsers: [
        "babel",
        "babel-flow",
        "babel-ts",
        "__babel_estree",
        "typescript",
        "flow",
        "meriyah",
        "acorn",
        "espree",
        "espree",
        "hermes",
        "oxc",
        "oxc-ts",
      ],
      verifyParsers: [
        "babel",
        "babel-flow",
        "babel-ts",
        "__babel_estree",
        "typescript",
        "flow",
        "meriyah",
        "acorn",
        "espree",
        "espree",
        "hermes",
        "oxc",
        "oxc-ts",
      ],
      extensions: [".js", ".jsx"],
    },
  ],
  [
    "less",
    {
      parsers: ["less"],
      verifyParsers: ["css", "scss"],
      extensions: [".less", ".unknown"],
    },
  ],
  ["lwc", { parsers: ["lwc"], verifyParsers: [], extensions: [".html"] }],
  [
    "markdown",
    { parsers: ["markdown"], verifyParsers: [], extensions: [".md"] },
  ],
  ["mdx", { parsers: ["mdx"], verifyParsers: [], extensions: [".mdx"] }],
  [
    "scss",
    {
      parsers: ["scss"],
      verifyParsers: ["css", "less"],
      extensions: [".scss", ".unknown"],
    },
  ],
  [
    "typescript",
    {
      parsers: ["typescript", "babel-ts", "oxc-ts"],
      verifyParsers: ["typescript", "babel-ts", "flow", "babel-flow", "oxc-ts"],
      extensions: [".ts", ".tsx", ".cts", ".mts"],
    },
  ],
  [
    "vue",
    { parsers: ["vue"], verifyParsers: [], extensions: [".vue", ".html"] },
  ],
  ["yaml", { parsers: ["yaml"], verifyParsers: [], extensions: [".yml"] }],
]);

const getParserCategories = (parser) => {
  const categories = [];
  for (const [category, { parsers }] of categoryParsers) {
    if (parsers.includes(parser)) {
      categories.push(category);
    }
  }

  return categories;
};

const verifyParsers = (context) => {
  if (!FULL_TEST) {
    return;
  }

  const { explicitParsers: parsers, dirname } = context;

  if (!Array.isArray(parsers) || parsers.length === 0) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  const category = getCategory(dirname);
  const settings = categoryParsers.get(category);

  if (!settings) {
    return;
  }

  const {
    parsers: allowedParsers = [],
    verifyParsers: allowedVerifyParsers = [],
  } = settings;

  const [parser, ...verifyParsers] = parsers;

  if (verifyParsers.includes(parser)) {
    throw new Error(
      `verifyParsers ${JSON.stringify(
        verifyParsers,
      )} should not include parser "${parser}".`,
    );
  }

  if (allowedParsers && !allowedParsers.includes(parser)) {
    const suggestCategories = getParserCategories(parser);

    const suggestion =
      suggestCategories.length === 0
        ? ""
        : outdent`
          Suggest move your tests to:
          ${suggestCategories
            .map(
              (category) => `- ${path.join(FORMAT_TEST_DIRECTORY, category)}`,
            )
            .join("\n")}

          Or config to allow use this parser in "${__filename}".
        `;

    throw new Error(
      `Parser "${parser}" should not used in "${dirname}".${
        suggestion ? `\n\n${suggestion}` : ""
      }`,
    );
  }

  if (allowedVerifyParsers) {
    for (const verifyParser of verifyParsers) {
      if (!allowedVerifyParsers.includes(verifyParser)) {
        throw new Error(
          outdent`
            Parser "${verifyParser}" should not used to verify in "${dirname}".
            Please remove it or config to allow use this parser in "${__filename}".
          `,
        );
      }
    }
  }
};

const verifyFilename = (context, basename, filename) => {
  if (!FULL_TEST) {
    return;
  }

  const { dirname } = context;

  const category = getCategory(dirname);
  const settings = categoryParsers.get(category);

  if (!settings) {
    return;
  }

  const { extensions = [] } = settings;

  const ext = path.extname(filename);
  if (!extensions.includes(ext)) {
    throw new Error(
      outdent`
        File "${basename}" should not tested in "${dirname}".
        Allowed extensions: ${extensions.join(",")}.
        Please rename it or config to allow test "${ext}" file in "${__filename}".
      `,
    );
  }
};

export { verifyFilename, verifyParsers };
