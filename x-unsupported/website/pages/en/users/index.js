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
                  display: "flex",
                  alignItems: "center",
                  fontSize: "125%",
                }}
              >
                <div className="prose">
                  Prettier is regularly used by more than <strong>70%</strong>
                  &nbsp;of the respondents to the “Utilities” section of
                  the&nbsp;
                  <a href="https://2020.stateofjs.com/en-US/other-tools/utilities">
                    State&nbsp;of&nbsp;JS&nbsp;2020
                  </a>{" "}
                  survey (14880&nbsp;developers out of 20974).
                </div>
                <a href="https://2020.stateofjs.com">
                  <img
                    title="State of JS 2020"
                    src="/images/state_of_js.svg"
                    width="180"
                    style={{ background: "#222429", borderRadius: 5 }}
                  />
                </a>
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
