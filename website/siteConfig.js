"use strict";

const fs = require("fs");

/* List of projects/orgs using your project for the users page */
const users = [
  // {
  //   caption: 'User1',
  //   image: '/test-site/img/docusaurus.svg',
  //   infoLink: 'https://www.example.com',
  //   pinned: true,
  // },
];

const siteConfig = {
  title: "Prettier" /* title for your website */,
  url: "https://prettier.io" /* your github url */,
  baseUrl: "/" /* base url for your project */,
  projectName: "prettier",
  repo: "prettier/prettier" /* repo for your project */,
  users,
  /* base url for editing docs, usage example: editUrl + 'en/doc1.md' */
  editUrl: "https://github.com/prettier/prettier/edit/master/docs/",
  /* header links for links on this site, 'LANGUAGE' will be replaced by whatever
     language the page is for, ex: 'en' */
  headerLinksInternal: [
    {
      section: "docs",
      href: "/docs/LANGUAGE/why-prettier.html",
      text: "Docs"
    },
    {
      section: "api",
      href: "/docs/LANGUAGE/why-prettier.html",
      text: "API"
    },
    { section: "help", href: "/LANGUAGE/help.html", text: "Help" },
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
      href: "https://github.com/prettier/prettier",
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
  tagline: "Opinonated Code Formatting"
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
