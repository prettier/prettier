"use strict";

const fs = require("fs");

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
  users,
  editors,
  supportedLanguages,
  /* base url for editing docs, usage example: editUrl + 'en/doc1.md' */
  editUrl: `${GITHUB_URL}/edit/master/docs/`,
  /* header links for links on this site, 'LANGUAGE' will be replaced by whatever
     language the page is for, ex: 'en' */
  headerLinksInternal: [
    {
      section: "docs",
      href: "/docs/LANGUAGE/why-prettier.html",
      text: "Docs"
    },
    // { section: "help", href: "/LANGUAGE/help/", text: "Help" },
    // {section: 'blog', href: '/test-site/blog', text: 'Blog'},
    {
      section: "playground",
      href: "/playground/",
      text: "Playground"
    }
  ],
  /* header links for links outside the site */
  headerLinksExternal: [
    {
      section: "github",
      href: GITHUB_URL,
      text: "GitHub"
    }
  ],
  /* path to images for header/footer */
  headerIcon: "icon.png",
  footerIcon: "icon.png",
  favicon: "icon.png",
  /* default link for docsSidebar */
  docsSidebarDefaults: {
    layout: "docs",
    root: "/docs/en/why-prettier.html",
    title: "Docs"
  },
  /* colors for website */
  colors: {
    primaryColor: "#1A2B34",
    secondaryColor: "#808080",
    prismColor:
      "rgba(26, 43, 52, 0.03)" /* primaryColor in rgba form, with 0.03 alpha */
  },
  tagline: "Opinionated Code Formatter"
};

let languages;
if (fs.existsSync("./languages.js")) {
  languages = require("./languages.js");
  siteConfig["en"] = require("./i18n/en.js");
} else {
  languages = [
    {
      enabled: true,
      name: "English",
      tag: "en"
    }
  ];
}

const enabledLanguages = languages.filter(lang => lang.enabled);

siteConfig.languages = enabledLanguages;

/* INJECT LOCALIZED FILES BEGIN */
/* INJECT LOCALIZED FILES END */

module.exports = siteConfig;
