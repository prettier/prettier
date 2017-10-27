"use strict";

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
// const Marked = CompLibrary.Marked; /* Used to read markdown */
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
                <small>{siteConfig.tagline}</small>
              </h2>
              <div className="section promoSection">
                <div className="promoRow">
                  <div className="pluginRowBlock">
                    <Button href="/playground/">Try It Out</Button>
                    <Button
                      href={"/docs/" + this.props.language + "/usage.html"}
                    >
                      Get Started
                    </Button>
                    <Button
                      href={"/docs/" + this.props.language + "/options.html"}
                    >
                      Options
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
            <br />
            {user.caption}
          </a>
        );
      });

    return (
      <div>
        <script src="redirect.js" />
        <HomeSplash language={language} />
        <div className="mainContainer">
          <div
            className="productShowcaseSection lightBackground paddingTop paddingBottom"
          >
            <h2>Language Support</h2>
            <Container>
              <GridBlock
                contents={siteConfig.supportedLanguages.map(language => ({
                  title: language.name,
                  image: language.image,
                  imageAlign: "top",
                  content: language.variants.join("\n\n")
                }))}
                layout="threeColumn"
              />
            </Container>
          </div>

          <div className="productShowcaseSection paddingBottom">
            <div className="productShowcaseTitleOuter">
              <h2>Editor Integration</h2>
              <div className="productShowcaseSmallCta">
                <p>
                  Developed an integration?
                  <a
                    href={`${siteConfig.githubUrl}/edit/master/website/editors.json`}
                  >
                    Add it here
                  </a>
                </p>
              </div>
            </div>

            <div className="productShowcaseInner">
              <Container>
                <GridBlock
                  contents={siteConfig.editors.map(editor => ({
                    content: editor.content || "",
                    image: editor.image,
                    imageAlign: "bottom",
                    title: editor.name
                  }))}
                  layout="fourColumn"
                />
              </Container>
            </div>
          </div>

          <div className="productShowcaseSection paddingTop paddingBottom lightBackground">
            <div className="productShowcaseTitleOuter">
              <h2>Who{"'"}s Using Prettier?</h2>
              <div className="productShowcaseActions">
                <p>
                  A few of the{" "}
                  <a href="https://www.npmjs.com/browse/depended/prettier">
                    many projects
                  </a>{" "}
                  using Prettier
                </p>
              </div>
            </div>
            <div className="productShowcaseInner">
              <div className="logos">{showcase}</div>
              <div className="productShowcaseFooter">
                <div className="more-users">
                  <a
                    className="button"
                    href={siteConfig.baseUrl + language + "/users/"}
                    target="_self"
                  >
                    More Prettier Users
                  </a>
                </div>
              </div>
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
