"use strict";

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
const Marked = CompLibrary.Marked; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + "/siteConfig.js");

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: "_self"
};

Button.propTypes = {
  href: React.PropTypes.string,
  target: React.PropTypes.string,
  children: React.PropTypes.any
};

class HomeSplash extends React.Component {
  render() {
    return (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">
            <div className="projectLogo">
              <img src="/icon.png" />
            </div>
            <div className="inner">
              <h2 className="projectTitle">
                {siteConfig.title}
                <small>Opinionated code formatting</small>
              </h2>
              <div className="section promoSection">
                <div className="promoRow">
                  <div className="pluginRowBlock">
                    <Button href="#try">Try It Out</Button>
                    <Button
                      href={
                        "/docs/" + this.props.language + "/why-prettier.html"
                      }
                    >
                      Example Link
                    </Button>
                    <Button
                      href={
                        "/docs/" + this.props.language + "/why-prettier.html"
                      }
                    >
                      Example Link 2
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

HomeSplash.propTypes = {
  language: React.PropTypes.string
};

class Index extends React.Component {
  render() {
    const language = this.props.language || "en";
    const showcase = siteConfig.users
      .filter(user => {
        return user.pinned;
      })
      .map((user, i) => {
        return (
          <a key={i} href={user.infoLink}>
            <img src={user.image} title={user.caption} />
          </a>
        );
      });

    return (
      <div>
        <script src="redirect.js" />
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Container padding={["bottom", "top"]}>
            <GridBlock
              align="center"
              contents={[
                {
                  content: "This is the content of my feature",
                  image: "/prettier.png",
                  imageAlign: "top",
                  title: "Feature One"
                },
                {
                  content: "The content of my second feature",
                  image: "/prettier.png",
                  imageAlign: "top",
                  title: "Feature Two"
                }
              ]}
              layout="fourColumn"
            />
          </Container>

          <div
            className="productShowcaseSection paddingBottom"
            style={{ textAlign: "center" }}
          >
            <h2>Feature Callout</h2>
            <Marked>These are features of this project</Marked>
          </div>

          <Container padding={["bottom", "top"]} background="light">
            <GridBlock
              contents={[
                {
                  content: "Talk about learning how to use this",
                  image: "/prettier.png",
                  imageAlign: "right",
                  title: "Learn How"
                }
              ]}
            />
          </Container>

          <Container padding={["bottom", "top"]} id="try">
            <GridBlock
              contents={[
                {
                  content: "Talk about trying this out",
                  image: "/prettier.png",
                  imageAlign: "left",
                  title: "Try it Out"
                }
              ]}
            />
          </Container>

          <Container padding={["bottom", "top"]} background="dark">
            <GridBlock
              contents={[
                {
                  content:
                    "This is another description of how this project is useful",
                  image: "/prettier.png",
                  imageAlign: "right",
                  title: "Description"
                }
              ]}
            />
          </Container>

          <div className="productShowcaseSection paddingBottom">
            <h2>Who{"'"}s Using This?</h2>
            <p>This project is used by all these people</p>
            <div className="logos">
              {showcase}
            </div>
            <div className="more-users">
              <a
                className="button"
                href={siteConfig.baseUrl + "users.html"}
                target="_self"
              >
                More Prettier Users
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  language: React.PropTypes.string
};

module.exports = Index;
