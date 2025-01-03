// @ts-check

import fs from "node:fs";
import { load as parseYaml } from "js-yaml";
import { themes as prismThemes } from "prism-react-renderer";

const packageJsonFile = new URL("../package.json", import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, "utf8"));
const GITHUB_URL = `https://github.com/${packageJson.repository}`;

/**
 *
 * @param {string} fsPath
 */
function loadYaml(fsPath) {
  return parseYaml(fs.readFileSync(new URL(fsPath, import.meta.url), "utf8"));
}

const users = loadYaml("./data/users.yml");
const editors = loadYaml("./data/editors.yml");
const supportedLanguages = loadYaml("./data/languages.yml");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Prettier",
  tagline: "Opinionated Code Formatter",
  favicon: "icon.png",

  // Set the production url of your site here
  url: packageJson.homepage,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "prettier", // Usually your GitHub org/user name.
  projectName: packageJson.name, // Usually your repo name.

  customFields: {
    users,
    editors,
    supportedLanguages,
    githubUrl: GITHUB_URL,
    tideliftUrl:
      "https://tidelift.com/subscription/pkg/npm-prettier?utm_source=npm-prettier&utm_medium=referral&utm_campaign=website",
  },

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // ------------------------- TODO -------------------------

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: "./sidebars.js",
          editUrl: `${GITHUB_URL}/edit/main/docs/`,
          path: "../docs",
          sidebarCollapsed: false,
          breadcrumbs: false,
        },
        blog: {
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          editUrl:
            "https://github.com/prettier/prettier/edit/main/website/blog/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    {
      // Replace with your project's social card
      image: "icon.png", // Done
      colorMode: {
        respectPrefersColorScheme: true, // Done
      },
      navbar: {
        title: "Prettier", // Done
        logo: {
          alt: "Prettier", // Done
          src: "icon.png", // Done
        },
        style: "dark",
        items: [
          {
            // Done
            type: "docSidebar",
            sidebarId: "docs",
            label: "Docs",
          },
          { to: "/blog", label: "Blog" }, // Done
          {
            // TODO
            href: "/playground/index.html",
            label: "Playground",
            position: "right",
          },
          {
            href: "https://opencollective.com/prettier",
            label: "Donate",
            position: "right",
          },
          {
            href: GITHUB_URL,
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
                label: "Tutorial",
                to: "/docs/intro",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/docusaurus",
              },
              {
                label: "Discord",
                href: "https://discordapp.com/invite/docusaurus",
              },
              {
                label: "X",
                href: "https://x.com/docusaurus",
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
                href: "https://github.com/facebook/docusaurus",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      // TODO: need to know the app ID
      // algolia: {
      //   appId: '<NEW_APP_ID>',
      //   apiKey: process.env.ALGOLIA_PRETTIER_API_KEY,
      //   indexName: "prettier",
      // },
      prism: {
        additionalLanguages: [
          "bash",
          "diff",
          "handlebars",
          "markup-templating", // Required for "handlebars"
          "toml",
          "ini",
          "vim",
        ],
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    },
};

export default config;
