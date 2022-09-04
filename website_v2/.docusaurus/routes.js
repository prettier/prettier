import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', 'fa5'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '966'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', '92e'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', '692'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '0a8'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '799'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '70c'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'dc0'),
    routes: [
      {
        path: '/docs/',
        component: ComponentCreator('/docs/', 'e7a'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/api',
        component: ComponentCreator('/docs/api', '7cd'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/browser',
        component: ComponentCreator('/docs/browser', 'c14'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/cli',
        component: ComponentCreator('/docs/cli', 'f01'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/comparison',
        component: ComponentCreator('/docs/comparison', 'b33'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/configuration',
        component: ComponentCreator('/docs/configuration', '640'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/editors',
        component: ComponentCreator('/docs/editors', 'a31'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/for-enterprise',
        component: ComponentCreator('/docs/for-enterprise', 'a07'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/ignore',
        component: ComponentCreator('/docs/ignore', '2a0'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/install',
        component: ComponentCreator('/docs/install', '21b'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/integrating-with-linters',
        component: ComponentCreator('/docs/integrating-with-linters', 'c56'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/option-philosophy',
        component: ComponentCreator('/docs/option-philosophy', '4cb'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/options',
        component: ComponentCreator('/docs/options', '182'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/plugins',
        component: ComponentCreator('/docs/plugins', '9aa'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/precommit',
        component: ComponentCreator('/docs/precommit', 'abb'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/rationale',
        component: ComponentCreator('/docs/rationale', '8c0'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/related-projects',
        component: ComponentCreator('/docs/related-projects', '9ab'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/technical-details',
        component: ComponentCreator('/docs/technical-details', '247'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/vim',
        component: ComponentCreator('/docs/vim', 'abc'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/watching-files',
        component: ComponentCreator('/docs/watching-files', '597'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/webstorm',
        component: ComponentCreator('/docs/webstorm', '93b'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/why-prettier',
        component: ComponentCreator('/docs/why-prettier', '448'),
        exact: true,
        sidebar: "docs"
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'aa4'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
