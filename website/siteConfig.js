"use strict";

const path = require("path");
const fs = require("fs");
const { load: parseYaml } = require("js-yaml");

const PACKAGE = require("../package.json");
const GITHUB_URL = `https://github.com/${PACKAGE.repository}`;

function loadYaml(fsPath) {
  return parseYaml(fs.readFileSync(path.join(__dirname, fsPath), "utf8"));
}

const users = loadYaml("./data/users.yml");
const editors = loadYaml("./data/editors.yml");
const supportedLanguages = loadYaml("./data/languages.yml");

const siteConfig = {
  title: "Prettier", // Done
  tagline: "Opinionated Code Formatter", // Done
  githubUrl: GITHUB_URL, // Done
  url: PACKAGE.homepage, // Done
  baseUrl: "/", // Done
  projectName: PACKAGE.name, // Done
  repo: PACKAGE.repository, // Done
  cname: "prettier.io", // Done
  users, // Done
  editors, // Done
  supportedLanguages, // Done
  tideliftUrl:
    "https://tidelift.com/subscription/pkg/npm-prettier?utm_source=npm-prettier&utm_medium=referral&utm_campaign=website", // Done
  /* base url for editing docs, usage example: editUrl + 'en/doc1.md' */
  editUrl: `${GITHUB_URL}/edit/main/docs/`, // Done
  headerLinks: [
    { href: "/playground/", label: "Playground" },
    { doc: "index", label: "Docs" }, // Done
    { blog: true, label: "Blog" }, // Done
    { search: true },
    { href: "https://opencollective.com/prettier", label: "Donate" },
    { href: GITHUB_URL, label: "GitHub" },
  ],
  /* path to images for header/footer */
  headerIcon: "icon.png", // Done
  footerIcon: "icon.png", // Done
  favicon: "icon.png", // Done
  /* colors for website */
  colors: {
    primaryColor: "#1A2B34", // Done
    secondaryColor: "#808080", // Done
  },
  highlight: {
    theme: "default", // Done
    version: require("highlight.js/package.json").version, // Done
  },
  usePrism: ["javascript", "jsx", "typescript", "ts", "js", "html", "css"], // Done
  useEnglishUrl: true,
  scripts: [
    "https://buttons.github.io/buttons.js",
    "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js",
    "/js/code-block-buttons.js",
  ],
  stylesheets: [
    "//unpkg.com/@sandhose/prettier-animated-logo@1.0.3/dist/wide.css",
  ],
  algolia: {
    apiKey: process.env.ALGOLIA_PRETTIER_API_KEY,
    indexName: "prettier",
  },
  // Done
  markdownPlugins: [
    // ignore `<!-- prettier-ignore -->` before passing into Docusaurus to avoid mis-parsing (#3322)
    (md) => {
      md.block.ruler.before(
        "htmlblock",
        "prettierignore",
        (state, startLine) => {
          const pos = state.bMarks[startLine];
          const max = state.eMarks[startLine];
          if (/<!-- prettier-ignore -->/u.test(state.src.slice(pos, max))) {
            state.line += 1;
            return true;
          }
          return false;
        },
      );
    },
  ],
  separateCss: ["static/separate-css"], // Done
  gaTrackingId: "UA-111350464-1",
  twitter: true,
  twitterUsername: "PrettierCode",
  twitterImage: "icon.png", // Done
  ogImage: "icon.png", // Done
  onPageNav: "separate", // Done
};

module.exports = siteConfig;
