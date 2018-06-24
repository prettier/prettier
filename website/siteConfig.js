"use strict";

// Docs: https://docusaurus.io/docs/en/site-config.html

const parseYaml = require("js-yaml").safeLoad;
const path = require("path");
const fs = require("fs");

const PACKAGE = require("../package");
const GITHUB_URL = `https://github.com/${PACKAGE.repository}`;

function loadYaml(fsPath) {
  return parseYaml(fs.readFileSync(path.join(__dirname, fsPath), "utf8"));
}

const users = loadYaml("./data/users.yml");
const editors = loadYaml("./data/editors.yml");
const supportedLanguages = loadYaml("./data/languages.yml");

const siteConfig = {
  title: "Prettier",
  tagline: "Opinionated Code Formatter",
  githubUrl: GITHUB_URL,
  url: PACKAGE.homepage,
  baseUrl: "/",
  projectName: PACKAGE.name,
  repo: PACKAGE.repository,
  cname: "prettier.io",
  users,
  editors,
  supportedLanguages,
  /* base url for editing docs, usage example: editUrl + 'en/doc1.md' */
  editUrl: `${GITHUB_URL}/edit/master/docs/`,
  headerLinks: [
    { href: "/playground/", label: "Playground" },
    { doc: "index", label: "About" },
    { doc: "install", label: "Usage" },
    { blog: true, label: "Blog" },
    { search: true },
    { href: GITHUB_URL, label: "GitHub" }
  ],
  /* path to images for header/footer */
  headerIcon: "icon.png",
  footerIcon: "icon.png",
  favicon: "icon.png",
  /* colors for website */
  colors: {
    primaryColor: "#1A2B34",
    secondaryColor: "#808080"
  },
  highlight: {
    theme: "default"
  },
  useEnglishUrl: true,
  scripts: ["https://buttons.github.io/buttons.js"],
  stylesheets: [
    "//unpkg.com/@sandhose/prettier-animated-logo@1.0.3/dist/wide.css"
  ],
  algolia: {
    apiKey: process.env.ALGOLIA_PRETTIER_API_KEY,
    indexName: "prettier"
  },
  markdownPlugins: [
    // ignore `<!-- prettier-ignore -->` before passing into Docusaurus to avoid mis-parsing (#3322)
    md => {
      md.block.ruler.before(
        "htmlblock",
        "prettierignore",
        (state, startLine) => {
          const pos = state.bMarks[startLine];
          const max = state.eMarks[startLine];
          if (/<!-- prettier-ignore -->/.test(state.src.slice(pos, max))) {
            state.line += 1;
            return true;
          }
          return false;
        }
      );
    }
  ],
  separateCss: ["static/separate-css"],
  gaTrackingId: "UA-111350464-1",
  twitter: true,
  onPageNav: "separate"
};

module.exports = siteConfig;
