"use strict";

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");
const CompLibrary = require("../../core/CompLibrary");
const Container = CompLibrary.Container;

const CWD = process.cwd();

const versions = require(`${CWD}/versions.json`);

const rootPackageJson = require(`${CWD}/../package.json`);
const masterVersion = rootPackageJson.version;
const isMasterDevVersion = masterVersion.endsWith("-dev");
const devVersion = isMasterDevVersion ? masterVersion : null;
const latestVersion = isMasterDevVersion
  ? rootPackageJson.devDependencies.prettier
  : masterVersion;

const latestDocsVersion = versions[0];
const pastDocsVersions = versions.slice(1);

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
                  (master)
                </td>
              </tr>
              {pastDocsVersions.length !== 0 &&
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
