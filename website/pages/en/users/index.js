"use strict";

const React = require("react");
const { Container } = require("../../../core/CompLibrary.js");

const siteConfig = require(process.cwd() + "/siteConfig.js");

class Users extends React.Component {
  render() {
    const showcase = siteConfig.users.map((user, i) => (
      <a key={i} href={user.infoLink}>
        <img src={user.image} title={user.caption} />
      </a>
    ));

    return (
      <div>
        <div className="mainContainer">
          <Container padding={["bottom", "top"]}>
            <div className="showcaseSection">
              <div className="prose">
                <h1>Who’s Using This?</h1>
              </div>
              <blockquote
                style={{
                  fontSize: "125%",
                  textAlign: "left",
                }}
              >
                <p>Prettier is regularly used by:</p>
                <ul>
                  <li>
                    <a href="https://2021.stateofjs.com/en-US/other-tools/#utilities">
                      More than <strong>83%</strong> of respondents to State of
                      JS 2021 (10282 developers out of 12360).
                    </a>
                  </li>
                  <li>
                    <a href="https://2020.stateofjs.com/en-US/other-tools/#utilities">
                      More than <strong>70%</strong> of respondents to State of
                      JS 2020 (14880 developers out of 20974).
                    </a>
                  </li>
                </ul>
              </blockquote>
              <div className="logos">{showcase}</div>
              <div className="prose">
                ...and{" "}
                <a href="https://www.npmjs.com/browse/depended/prettier">
                  many more projects
                </a>
              </div>
            </div>
          </Container>
        </div>
      </div>
    );
  }
}

Users.defaultProps = {
  language: "en",
};

Users.title = "Who's using Prettier?";

module.exports = Users;
