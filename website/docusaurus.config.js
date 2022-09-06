/* eslint-disable unicorn/prefer-module */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const PACKAGE = require("../package.json");
const GITHUB_URL = `https://github.com/${PACKAGE.repository}`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Prettier",
  staticDirectories: ["static"],
  tagline: "Opinionated Code Formatter",
  url: PACKAGE.homepage,
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "prettier",
  projectName: "prettier",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: `${GITHUB_URL}/edit/main/docs/`,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    {
      navbar: {
        title: "Prettier",
        logo: {
          alt: "My Site Logo",
          src: "icon.png",
        },
        style: "dark",
        items: [
          { to: "/playground", label: "Playground", position: "right" },
          { to: "/docs", label: "Docs", position: "right" },
          { to: "/blog", label: "Blog", position: "right" },
          {
            href: "https://opencollective.com/prettier",
            label: "Donate",
            position: "right",
          },
          {
            href: "https://github.com/prettier/prettier",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "About",
                to: "/",
              },
              {
                label: "Usage",
                to: "/usage",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "User Showcase",
                to: "/users",
              },
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/prettier",
              },
              {
                label: "PrettierCode on Twitter",
                href: "https://twitter.com/prettiercode",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/prettier/prettier",
              },
              {
                label: "Issues",
                href: "https://github.com/prettier/prettier/issues",
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    },
};

module.exports = config;
