// @ts-check

import fs from "node:fs";
import { createRequire } from "node:module";
import { load as parseYaml } from "js-yaml";
import { themes as prismThemes } from "prism-react-renderer";

const require = createRequire(import.meta.url);

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
  titleDelimiter: "·",

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

  stylesheets: [
    "https://unpkg.com/@sandhose/prettier-animated-logo@1.0.3/dist/wide.css",
  ],

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          sidebarPath: "./sidebars.json",
          /** @type {import('@docusaurus/plugin-content-docs').EditUrlFunction} */
          editUrl: ({ docPath }) => `${GITHUB_URL}/edit/main/docs/${docPath}`,
          path: "../docs",
          sidebarCollapsed: false,
          breadcrumbs: false,
          versions: {
            current: {
              label: "next",
              badge: false,
            },
            stable: {
              label: "stable",
              badge: false,
            },
          },
        },
        blog: {
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          blogTitle: "Prettier blog",
          blogDescription: "Read blog posts about Prettier from the team",
          editUrl: `${GITHUB_URL}/edit/main/website/`,
          blogSidebarCount: 10,
          blogSidebarTitle: "Recent posts",
          postsPerPage: 10,
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "throw",
        },
        theme: {
          customCss: [
            "./src/css/custom.css",
            require.resolve("react-tweet/theme.css"),
          ],
        },
        gtag: {
          trackingID: "G-T57CP1SG02",
          anonymizeIP: true,
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    {
      // Replace with your project's social card
      image: "icon.png",
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "Prettier",
        logo: {
          alt: "",
          src: "icon.png",
        },
        style: "dark",
        items: [
          {
            type: "docsVersionDropdown",
          },
          {
            href:
              process.env.NODE_ENV === "production"
                ? "pathname:///playground/"
                : "http://localhost:5173/",
            label: "Playground",
            position: "right",
            target: "_self",
          },
          {
            type: "docSidebar",
            sidebarId: "docs",
            label: "Docs",
            position: "right",
          },
          { to: "/blog", label: "Blog", position: "right" },
          {
            href: "https://opencollective.com/prettier",
            label: "Donate",
            position: "right",
          },
          {
            "aria-label": "GitHub repository",
            className: "header-github-link",
            href: GITHUB_URL,
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
                to: "/docs",
              },
              {
                label: "Usage",
                to: "/docs/install",
              },
              {
                html: /*html*/ `
                  <a href="https://www.netlify.com" target="_blank" rel="noreferrer noopener" aria-label="Deploys by Netlify">
                    <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Deploys by Netlify" width="114" height="51" style="margin-top: 8px;" />
                  </a>
                `,
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
                href: "http://stackoverflow.com/questions/tagged/prettier",
              },
              {
                label: "@PrettierCode on Twitter",
                href: "https://twitter.com/PrettierCode",
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
                href: GITHUB_URL,
              },
              {
                label: "Issues",
                href: `${GITHUB_URL}/issues`,
              },
              {
                html: /*html*/ `
                  <a
                    href="https://github.com/prettier/prettier"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Star this project on GitHub"
                    class="footer__github-stars"
                  >
                    <img src="https://img.shields.io/github/stars/prettier/prettier?style=social" loading="lazy" alt="Star this project on GitHub" />
                  </a>
                `,
              },
            ],
          },
        ],
      },
      algolia: {
        appId: "OHFQ1H5TQS",
        apiKey: "ecfff8a35d82ecff7e911d57d7be8510",
        indexName: "prettier",
      },
      prism: {
        additionalLanguages: [
          "bash",
          "diff",
          "handlebars",
          "markup-templating", // Required for "handlebars"
          "toml",
          "ini",
          "vim",
          "scss",
          "less",
        ],
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    },

  future: { experimental_faster: true },
};

export default config;
