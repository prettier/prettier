import path from "node:path";
import createEsmUtils from "esm-utils";
import { outdent } from "outdent";

const { __dirname, __filename } = createEsmUtils(import.meta);

const TESTS_ROOT = path.join(__dirname, "../../format");

const getCategory = (dirname) =>
  path.relative(TESTS_ROOT, dirname).split(path.sep).shift();

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
      verifyParsers: ["flow", "babel-flow", "typescript", "babel-ts"],
      extensions: [".js", ".cjs", ".mjs"],
    },
  ],
  [
    "flow-repo",
    {
      parsers: ["flow", "babel-flow"],
      verifyParsers: ["flow", "babel-flow", "typescript", "babel-ts"],
      extensions: [".js", ".cjs", ".mjs"],
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
      parsers: ["babel", "acorn", "espree", "meriyah", "oxc", "oxc-ts"],
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
        "meriyah",
        "espree",
        "flow",
        "babel-flow",
        "typescript",
        "babel-ts",
      ],
      verifyParsers: [
        "babel",
        "meriyah",
        "espree",
        "flow",
        "babel-flow",
        "typescript",
        "babel-ts",
      ],
      extensions: [".js", ".jsx"],
    },
  ],
  [
    "less",
    {
      parsers: ["less"],
      verifyParsers: ["css", "scss"],
      extensions: [".less"],
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
      extensions: [".scss"],
    },
  ],
  [
    "stylefmt-repo",
    { parsers: ["css", "scss"], verifyParsers: [], extensions: [".css"] },
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

const checkParser = ({ dirname, files }, parsers = []) => {
  const category = getCategory(dirname);
  const categoryAllowedParsers = categoryParsers.get(category);

  if (!categoryAllowedParsers) {
    return;
  }

  const {
    parsers: allowedParsers = [],
    verifyParsers: allowedVerifyParsers = [],
    extensions = [],
  } = categoryAllowedParsers;

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
            .map((category) => `- ${path.join(TESTS_ROOT, category)}`)
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

  for (const { name, filename } of files) {
    const ext = path.extname(filename);
    if (!extensions.includes(ext)) {
      throw new Error(
        outdent`
          File "${name}" should not tested in "${dirname}".
          Allowed extensions: ${extensions.join(",")}.
          Please rename it or config to allow test "${ext}" file in "${__filename}".
        `,
      );
    }
  }
};

export default checkParser;
