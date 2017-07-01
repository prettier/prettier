
## Configuration
In the project repo, the `docs` folder is used to hold documentation written in markdown. A `blog` folder can be used to hold blog posts written in markdown.

### Document and Blog Front Matters

Documentation should contain front matter that follows this example:
```
---
id: doc1 <!-- used for docs to find each other and to map links -->
title: Document Title
layout: docs1 <!-- used to determine different sidebar groupings -->
category: Sidebar Category 1 <!-- Category on the sidebar under which this doc goes -->
permalink: docs/en/doc1.html <!-- link to the document that is used for site -->
previous: doc0 <!-- previous doc on sidebar for navigation -->
next: doc2 <!-- next doc on the sidebar for navigation -->
<!-- don't include next if this is the last doc; don't include previous if first doc -->
---
```

Blog posts should be written as markdown files with the following front matter:
```
---
title: Blog Post Title
author: Author Name
authorURL: http://twitter.com/author <!-- (or some other link) -->
authorFBID: 21315325 <!-- id to get author's picture -->
---
```
In the blog post you should include a line `<!--truncate-->`. This will determine under which point text will be ignored when generating the preview of your blog post. Blog posts should have the file name format: `yyyy-mm-dd-your-file-name.md`.

### Language Configurations

The `examples` script will generate a `languages.js` file and `i18n` folder for translation support, but if you only wish to support English, then these are not needed.

### Site Configurations

Configure the siteConfig.js file which has comments guiding you through what needs to be done and how each configuration affects your website.

Customize core/Footer.js which will serve as the footer for each page on your website.

Include your own top-level pages as React components in `pages/`. These components should just be the body sections of the pages you want, and they will be included with the header and footer that the rest of Docusaurus uses. Examples are provided for your reference. Currently, if you want to add other React components to your pages, you must include all of it inside that file due to how `require` paths are set-up. You may also include `.html` files directly, but this is not recommended, and these will just be served as is and will not have any of the header/footer/styles shared by the rest of Docusaurus.

All images and other static assets you wish to include should be placed inside the `static` folder. Any `.css` files provided in `static` will be concatenated to the standard styles provided by Docusaurus and used site-wide.

Files placed in `static/` will be accessible in the following way: `static/img/image.png` will be accessible at `img/image.png`.

## Using Docusaurus

### Run the Server

To run your website locally run the script:

```
yarn start
```

This will start a server hosting your website locally at `localhost:3000`. This server will ignore any occurences `siteConfig.baseUrl` in URLs, e.g. `localhost:3000/your-site/index.html` will be the same as `localhost:3000/index.html`. Any changes to configured files will be reflected by refreshing the page, i.e. the server does not need to be restarted to show changes.


### Build Static Pages

To create a static build of your website, run the script:

```
yarn build
```

This will generate `.html` files from all of your docs and other pages included in `pages/`. This allows you to check whether or not all your files are being generated correctly. The build folder is inside Docusaurus's directory inside `node_modules`.

### Publishing Your Website

Use CircleCI to publish your website whenever your project repo is updated. Configure your circle.yml file in your project repo to run commands to publish to GitHub Pages. An example is shown here:

```yaml
machine:
  node:
    version: 6.10.3
  npm:
    version: 3.10.10

test:
  override:
    - "true"

deployment:
  website:
    branch: master
    commands:
      - git config --global user.email "test-site-bot@users.noreply.github.com"
      - git config --global user.name "Website Deployment Script"
      - echo "machine github.com login test-site-bot password $GITHUB_TOKEN" > ~/.netrc
      - cd website && npm install && GIT_USER=test-site-bot npm run publish-gh-pages
```

Note that in this case a GitHub user `test-site-bot` is created to use just for publishing. Make sure to give your Git user push permissions for your project and to set a GITHUB_TOKEN environment variable in Circle if you choose to publish this way.

If you wish to manually publish your website with the `publish-gh-pages` script, run the following example command with the appropriate variables for your project:

```
DEPLOY_USER=deltice GIT_USER=test-site-bot CIRCLE_PROJECT_USERNAME=deltice CIRCLE_PROJECT_REPONAME=test-site CIRCLE_BRANCH=master npm run publish-gh-pages
```
