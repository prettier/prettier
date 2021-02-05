"use strict";

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");
const { Container } = require("../../core/CompLibrary");

const CWD = process.cwd();

const versions = require(`${CWD}/versions.json`);

const rootPackageJson = require(`${CWD}/../package.json`);
const defaultBranchVersion = rootPackageJson.version;
const isDefaultBranchDevVersion = defaultBranchVersion.endsWith("-dev");
const devVersion = isDefaultBranchDevVersion ? defaultBranchVersion : null;
const latestVersion = isDefaultBranchDevVersion
  ? rootPackageJson.devDependencies.prettier
  : defaultBranchVersion;
const [latestDocsVersion, ...pastDocsVersions] = versions;

function Versions(props) {
  const { config: siteConfig } = props;
  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer versionsContainer">
        <div className="post">
          <header className="postHeader">
            <h1>{siteConfig.title} Versions</h1>
          </header>
          <table className="versions">
            <tbody>
              <tr>
                <th>Version</th>
                <th>Install with</th>
                <th>Documentation</th>
              </tr>
              <tr>
                <td>{latestVersion}</td>
                <td>
                  <code>npm install prettier</code>
                </td>
                <td>
                  <a href={`${siteConfig.baseUrl}docs/en/index.html`}>
                    {latestDocsVersion}
                  </a>{" "}
                  (latest)
                </td>
              </tr>
              <tr>
                <td>{devVersion}</td>
                <td>
                  <code>npm install prettier/prettier</code>
                </td>
                <td>
                  <a href={`${siteConfig.baseUrl}docs/en/next/index.html`}>
                    next
                  </a>{" "}
                  (main)
                </td>
              </tr>
              {pastDocsVersions.length > 0 &&
                pastDocsVersions.map((pastDocsVersion, index) => {
                  const pastMajorVersion = pastDocsVersion.replace(/^v/, "");
                  return (
                    <tr key={index}>
                      <td>{pastMajorVersion}.x</td>
                      <td>
                        <code>
                          npm install prettier@
                          {pastMajorVersion}
                        </code>
                      </td>
                      <td>
                        <a
                          href={`${siteConfig.baseUrl}docs/en/${pastDocsVersion}/index.html`}
                        >
                          {pastDocsVersion}
                        </a>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}

module.exports = Versions;
