"use strict";

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
const MarkdownBlock = CompLibrary.MarkdownBlock;
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;
const AnimatedLogo = require(process.cwd() + "/components/AnimatedLogo");

const siteConfig = require(process.cwd() + "/siteConfig.js");

const ButtonGroup = props => (
  <div className="buttonGroup buttonWrapper">{props.children}</div>
);

ButtonGroup.propTypes = {
  children: React.PropTypes.node
};

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

const HomeSplash = props => {
  return (
    <div className="homeContainer">
      <div className="homeSplashFade">
        <div className="wrapper homeWrapper">
          <div className="animatedLogoWrapper">
            <AnimatedLogo />
          </div>
          <div className="inner">
            <div className="section promoSection">
              <div className="promoRow">
                <div className="pluginRowBlock">
                  <Button href="/playground/">Try It Out</Button>
                  <Button href={"/docs/" + props.language + "/install.html"}>
                    Get Started
                  </Button>
                  <Button href={"/docs/" + props.language + "/options.html"}>
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
};

HomeSplash.propTypes = {
  language: React.PropTypes.string
};

const TldrSection = ({ language }) => (
  <div className="tldrSection productShowcaseSection lightBackground paddingTop paddingBottom">
    <Container>
      <div
        style={{
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "space-evenly"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>What is Prettier?</h2>
          <ul style={{ flex: "1" }}>
            <li>An opinionated code formatter</li>
            <li>Supports many languages</li>
            <li>Integrates with the most editors</li>
            <li>Has few options</li>
          </ul>
          <Button href={"/docs/" + language + "/index.html"}>What Else?</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>Why?</h2>
          <ul style={{ flex: "1" }}>
            <li>You press save and code is formatted</li>
            <li>No need to discuss style in code review</li>
            <li>Saves you time and energy</li>
          </ul>
          <Button href={"/docs/" + language + "/why-prettier.html"}>
            Why Else?
          </Button>
        </div>
      </div>
    </Container>
  </div>
);

TldrSection.propTypes = {
  language: React.PropTypes.string
};

const LanguagesSection = () => (
  <div
    className="languagesSection productShowcaseSection paddingTop paddingBottom"
    style={{ textAlign: "center" }}
  >
    <Container>
      <h2 style={{ margin: 0 }}>Language Support</h2>
      <GridBlock
        align="center"
        contents={siteConfig.supportedLanguages.map(language => ({
          title: language.name,
          image: language.image,
          imageAlign: "top",
          content: language.variants.join("\n\n")
        }))}
        layout="fourColumn"
      />
    </Container>
  </div>
);

const Editor = ({ content = "", image, name }) => (
  <div className="editor" style={{ display: "flex", width: "235px" }}>
    <img className="editorImage" src={image} />
    <div style={{ flexGrow: 1, paddingLeft: "12px" }}>
      <h3 style={{ marginBottom: "-16px" }}>{name}</h3>
      <MarkdownBlock>{content.replace(/\n/g, "  \n")}</MarkdownBlock>
    </div>
  </div>
);

Editor.propTypes = {
  content: React.PropTypes.string,
  image: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired
};

const EditorSupportSection = () => (
  <div className="editorSupportSection productShowcaseSection lightBackground paddingTop paddingBottom">
    <Container>
      <h2>Editor Support</h2>
      <div
        style={{
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "space-around"
        }}
      >
        {siteConfig.editors.map(editor => (
          <Editor key={editor.name} {...editor} />
        ))}
      </div>
    </Container>

    <div style={{ float: "right" }}>
      <span>Got more? </span>
      <a
        href={`${siteConfig.githubUrl}/edit/master/website/data/editors.yml`}
        className="button"
      >
        Send a PR
      </a>
    </div>
  </div>
);

const bash = (...args) => `~~~bash\n${String.raw(...args)}\n~~~`;

const json = object => `~~~json\n${JSON.stringify(object, null, 2)}\n~~~`;

class GetStartedSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      npmClient: "yarn"
    };
  }

  render() {
    return (
      <div className="getStartedSection productShowcaseSection paddingTop paddingBottom">
        <Container>
          <div
            className="getStartedFlexContainer"
            style={{
              display: "flex",
              flexFlow: "row",
              alignItems: "baseline",
              justifyContent: "space-between"
            }}
          >
            <div>
              <h2>Get Started</h2>
              <ol>
                <li>
                  Add prettier to your project:
                  <div className="yarnOnly">
                    <MarkdownBlock>
                      {bash`yarn add prettier --dev --exact`}
                    </MarkdownBlock>
                  </div>
                  <div className="npmOnly">
                    <MarkdownBlock>
                      {bash`npm install prettier --save-dev --save-exact`}
                    </MarkdownBlock>
                  </div>
                </li>
                <li>
                  Verify by running against a file:
                  <div className="yarnOnly">
                    <MarkdownBlock>
                      {bash`yarn prettier --write src/index.js`}
                    </MarkdownBlock>
                  </div>
                  <div className="npmOnly">
                    <MarkdownBlock>
                      {bash`npx prettier --write src/index.js`}
                    </MarkdownBlock>
                  </div>
                </li>
                <li>
                  Run prettier when commiting files:
                  <div className="yarnOnly">
                    <MarkdownBlock>
                      {bash`yarn add pretty-quick husky --dev`}
                    </MarkdownBlock>
                  </div>
                  <div className="npmOnly">
                    <MarkdownBlock>
                      {bash`npm install pretty-quick husky --save-dev`}
                    </MarkdownBlock>
                  </div>
                  Then edit <code>package.json</code>:
                  <MarkdownBlock>
                    {json({
                      scripts: {
                        precommit: "pretty-quick --staged"
                      }
                    })}
                  </MarkdownBlock>
                </li>
              </ol>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                flexGrow: 1
              }}
            >
              <ButtonGroup>
                <a className="button active showYarnButton" href="#">
                  yarn
                </a>
                <a className="button showNpmButton" href="#">
                  npm
                </a>
              </ButtonGroup>
              <img
                className="decorativeRects"
                style={{ marginTop: "32px", maxWidth: "400px", width: "100%" }}
                src="/images/get_started_rects.svg"
              />
            </div>
          </div>
        </Container>
      </div>
    );
  }
}

const UsersSection = ({ language }) => {
  const showcase = siteConfig.users
    .filter(user => {
      return user.pinned;
    })
    .map((user, i) => {
      return (
        <a key={i} className="growOnHover" href={user.infoLink}>
          <img className="user" src={user.greyImage} title={user.caption} />
        </a>
      );
    });

  return (
    <div className="usersSection productShowcaseSection lightBackground paddingTop paddingBottom">
      <Container>
        <h2>Used By People You Rely On</h2>
        <div style={{ textAlign: "right" }} />
        <div className="logos">{showcase}</div>
        <div className="more-users">
          <a
            className="button"
            href={siteConfig.baseUrl + language + "/users/"}
            target="_self"
          >
            See All Others
          </a>
          <a
            className="button"
            href={`${siteConfig.githubUrl}/edit/master/website/data/users.yml`}
          >
            Add Your Project
          </a>
        </div>

        <h2>Established Ecosystem</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            flexFlow: "row wrap"
          }}
        >
          <div style={{ display: "flex", marginTop: "12px" }}>
            <a
              href="https://npmjs.com/package/prettier"
              className="growOnHover"
            >
              <img src="/images/npm_grey.svg" style={{ height: "100px" }} />
            </a>
            <div style={{ marginLeft: ".7em", width: "300px" }}>
              <p>More than 500 tools and integrations on npm</p>
              <Button href="https://www.npmjs.com/browse/depended/prettier">
                Install them!
              </Button>
            </div>
          </div>
          <div style={{ display: "flex", marginTop: "12px" }}>
            <a
              href="https://github.com/prettier/prettier"
              className="growOnHover"
            >
              <img src="/images/github_grey.svg" style={{ height: "100px" }} />
            </a>
            <div style={{ marginLeft: ".7em", width: "300px" }}>
              <p>More than 50,000 dependant repositories on GitHub</p>
              <Button href="https://github.com/prettier/prettier/network/dependents">
                Check them out!
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

UsersSection.propTypes = {
  language: React.PropTypes.string
};

class Index extends React.Component {
  render() {
    const language = this.props.language || "en";

    return (
      <div>
        <script src="landing.js" />
        <HomeSplash language={language} />
        <div className="mainContainer">
          <TldrSection language={language} />
          <LanguagesSection />
          <EditorSupportSection />
          <GetStartedSection />
          <UsersSection language={language} />
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  language: React.PropTypes.string
};

module.exports = Index;
