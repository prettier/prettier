"use strict";

const PACKAGE = require("../package");
const GITHUB_URL = `https://github.com/${PACKAGE.repository}`;

const users = require("./users");
const editors = require("./editors");
const supportedLanguages = require("./languages");

const siteConfig = {
  title: "Prettier",
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
    { doc: "why-prettier", label: "Docs" },
    { href: "/playground/", label: "Playground" },
    { href: GITHUB_URL, label: "GitHub" }
  ],
  /* path to images for header/footer */
  headerIcon: "icon.png",
  footerIcon: "icon.png",
  favicon: "icon.png",
  /* colors for website */
  colors: {
    primaryColor: "#1A2B34",
    secondaryColor: "#808080",
    prismColor:
      "rgba(26, 43, 52, 0.03)" /* primaryColor in rgba form, with 0.03 alpha */
  },
  tagline: "Opinionated Code Formatter",
  useEnglishUrl: true
};

module.exports = siteConfig;
