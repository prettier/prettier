"use strict";

const React = require("react");
const PropTypes = require("prop-types");
const AnimatedLogo = require("@sandhose/prettier-animated-logo");
const { MarkdownBlock, Container } = require("../../core/CompLibrary.js");

const siteConfig = require(process.cwd() + "/siteConfig.js");

const ButtonGroup = (props) => (
  <div className="buttonGroup buttonWrapper">{props.children}</div>
);

ButtonGroup.propTypes = {
  children: PropTypes.node,
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
  target: "_self",
};

Button.propTypes = {
  href: PropTypes.string,
  target: PropTypes.string,
  children: PropTypes.any,
};

function Tidelift() {
  return (
    <a className="tidelift" href={siteConfig.tideliftUrl}>
      PRETTIER FOR ENTERPRISE
    </a>
  );
}

const HomeSplash = (props) => (
  <div className="homeContainer">
    <Tidelift />
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">
        <div className="animatedLogoWrapper">
          <AnimatedLogo version="wide" />
        </div>
        <div className="inner">
          <div className="section promoSection">
            <div className="promoRow">
              <div className="pluginRowBlock">
                <Button href="/playground/">Try It Online</Button>&nbsp;
                <Button href={"/docs/" + props.language + "/install.html"}>
                  Install Prettier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

HomeSplash.propTypes = {
  language: PropTypes.string,
};

const TldrSection = ({ language }) => (
  <div className="tldrSection productShowcaseSection lightBackground">
    <Container>
      <div
        style={{
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "space-evenly",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>What is Prettier?</h2>
          <ul style={{ flex: "1" }}>
            <li>An opinionated code formatter</li>
            <li>Supports many languages</li>
            <li>Integrates with most editors</li>
            <li>
              <a href={"/docs/" + language + "/option-philosophy.html"}>
                Has few options &raquo;
              </a>
            </li>
          </ul>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>Why?</h2>
          <ul style={{ flex: "1" }}>
            <li>Your code is formatted on save</li>
            <li>No need to discuss style in code review</li>
            <li>Saves you time and energy</li>
            <li>
              <a href={"/docs/" + language + "/why-prettier.html"}>
                And more &raquo;
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Container>
  </div>
);

TldrSection.propTypes = {
  language: PropTypes.string,
};

const Language = ({ name, nameLink, showName, image, variants }) => (
  <div
    className="languageCategory"
    style={{
      display: "flex",
      alignItems: "flex-start",
      paddingBottom: "1em",
    }}
  >
    <img src={image} style={{ width: "50px", padding: "0 20px" }} />
    <ul>
      {showName && (
        <li className="accented">
          {nameLink ? <a href={nameLink}>{name}</a> : name}
        </li>
      )}
      {variants.map((variant) => (
        <li key={variant}>
          <MarkdownBlock>{variant}</MarkdownBlock>
        </li>
      ))}
    </ul>
  </div>
);

Language.propTypes = {
  name: PropTypes.string,
  nameLink: PropTypes.string,
  showName: PropTypes.bool,
  image: PropTypes.string,
  variants: PropTypes.array,
};

const LanguagesSection = () => {
  const languageChunks = siteConfig.supportedLanguages.reduce(
    (acc, language) => {
      const last = acc.at(-1);
      if (
        last &&
        last.length < 2 &&
        last.reduce((sum, lang) => sum + lang.variants.length, 0) +
          language.variants.length <
          9
      ) {
        last.push(language);
      } else {
        acc.push([language]);
      }
      return acc;
    },
    [],
  );

  return (
    <div
      className="languagesSection productShowcaseSection lightBackground"
      style={{ textAlign: "center" }}
    >
      <Container>
        <h2>Works with the Tools You Use</h2>
        <div
          style={{
            display: "flex",
            flexFlow: "row wrap",
            justifyContent: "space-around",
          }}
        >
          {languageChunks.map((languageChunk, index) => (
            <div key={index} style={{ flex: "1 1 auto" }}>
              {languageChunk.map((language) => (
                <Language key={language.name} {...language} />
              ))}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

const Editor = ({ content = "", image, name }) => (
  <div className="editor">
    <img className="editorImage" src={image} />
    <div className="editorInfo">
      <h3 className="editorName">{name}</h3>
      <MarkdownBlock>{content.replaceAll("\n", "  \n")}</MarkdownBlock>
    </div>
  </div>
);

Editor.propTypes = {
  content: PropTypes.string,
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const EditorSupportSection = () => (
  <div className="editorSupportSection productShowcaseSection">
    <Container>
      <h2>Editor Support</h2>
      <div
        style={{
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "space-around",
        }}
      >
        {siteConfig.editors.map((editor) => (
          <Editor key={editor.name} {...editor} />
        ))}
      </div>
    </Container>

    <div style={{ float: "right" }}>
      <span>Got more? </span>
      <a
        href={`${siteConfig.githubUrl}/edit/main/website/data/editors.yml`}
        className="button"
      >
        Send a PR
      </a>
    </div>
  </div>
);

const UsersSection = ({ language }) => {
  const showcase = siteConfig.users
    .filter((user) => user.pinned)
    .map((user, i) => (
      <a key={i} className="growOnHover alignCenter" href={user.infoLink}>
        <img className="user" src={user.greyImage} title={user.caption} />
      </a>
    ));

  return (
    <div className="usersSection productShowcaseSection lightBackground">
      <Container>
        <h2>Used By People You Rely On</h2>
        <div style={{ textAlign: "right" }} />
        <div
          style={{
            display: "flex",
            flexFlow: "row wrap",
            justifyContent: "space-around",
          }}
        >
          {showcase}
        </div>
        <div className="more-users">
          <a
            className="button"
            href={siteConfig.baseUrl + language + "/users/"}
            target="_self"
            style={{ marginRight: "10px" }}
          >
            See Others
          </a>
        </div>

        <h2 className="ecosystemSubHeader">Established in the Ecosystem</h2>
        <div
          className="ecosystemSubSection"
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexFlow: "row wrap",
          }}
        >
          <div style={{ display: "flex", marginTop: "22px" }}>
            <a
              href="https://2021.stateofjs.com/en-US/other-tools/utilities"
              style={{ marginTop: "15px" }}
            >
              <img
                src="/images/state_of_js_grey.svg"
                style={{ width: "80px" }}
              />
            </a>
            <div style={{ marginLeft: ".7em", width: "260px" }}>
              <p>Regularly used by:</p>
              <ul style={{ marginBottom: "0" }}>
                <li>
                  <a href="https://2021.stateofjs.com/en-US/other-tools/#utilities">
                    More than 83% of respondents to State of JS 2021.
                  </a>
                </li>
                <li>
                  <a href="https://2020.stateofjs.com/en-US/other-tools/#utilities">
                    More than 70% of respondents to State of JS 2020.
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", marginTop: "22px" }}>
            <a href="https://github.com/prettier/prettier">
              <img src="/images/github_grey.svg" style={{ width: "80px" }} />
            </a>
            <div style={{ marginLeft: ".7em", width: "260px" }}>
              <p>
                More than{" "}
                <strong data-placeholder="dependent-github">7.2 million</strong>{" "}
                dependent repositories on GitHub
              </p>
              <Button href="https://github.com/prettier/prettier/network/dependents">
                Check Them Out
              </Button>
            </div>
          </div>

          <div style={{ display: "flex", marginTop: "22px" }}>
            <a href="https://npmjs.com/package/prettier">
              <img src="/images/npm_grey.svg" style={{ width: "80px" }} />
            </a>
            <div style={{ marginLeft: ".7em", width: "260px" }}>
              <p>
                More than{" "}
                <strong data-placeholder="dependent-npm">16.3k</strong>{" "}
                dependent packages on npm
              </p>
              <Button href="https://www.npmjs.com/browse/depended/prettier">
                See them all
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

UsersSection.propTypes = {
  language: PropTypes.string,
};

const tierTitle = new Map([
  ["gold", "Gold Sponsors"],
  ["silver", "Silver Sponsors"],
  ["bronze", "Bronze Sponsors"],
  ["backers", "Backers"],
]);
const tierDescription = new Map([
  [
    "gold",
    "Gold sponsors are those who have donated an average of $500 over the past 12 months.",
  ],
  [
    "silver",
    "Silver sponsors are those who have donated an average of $300 to $500 over the past 12 months.",
  ],
  [
    "bronze",
    "Bronze sponsors are those who have donated an average of $100 to $300 over the past 12 months.",
  ],
  [
    "backers",
    "Backers are those who have donated less than an average of $100 over the past 12 months.",
  ],
]);
const tierIconSize = new Map([
  ["gold", "120px"],
  ["silver", "100px"],
  ["bronze", "80px"],
  ["backers", "40px"],
]);
const SponsorsTier = ({ tier, sponsors }) => {
  return (
    <div className={`sponsorsTier ${tier}`}>
      <h3>{tierTitle.get(tier)}</h3>
      <p>{tierDescription.get(tier)}</p>
      <div className="sponsorAvatars">
        {sponsors.map((sponsor) => (
          <div key={sponsor.name}>
            <a href={sponsor.website}>
              <img
                src={sponsor.avatar}
                title={sponsor.name}
                height={tierIconSize.get(tier)}
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

const SponsorsSection = () => {
  const { gold, silver, bronze, backers } = siteConfig.sponsors;
  return (
    <div className="sponsorsSection productShowcaseSection">
      <Container>
        <h2>Sponsors</h2>
        <p className="description">
          Prettier is maintained by a small team of volunteers. Funds collected
          from sponsors are paid out monthly to two maintainers, allowing them
          to continue maintenance. If Prettier is useful to you, please consider
          becoming our sponsor on{" "}
          <a href="https://opencollective.com/prettier">OpenCollective</a> or{" "}
          <a href="https://github.com/sponsors/prettier">GitHub Sponsors</a>.
        </p>
        <SponsorsTier tier="gold" sponsors={gold || []} />
        <SponsorsTier tier="silver" sponsors={silver || []} />
        <SponsorsTier tier="bronze" sponsors={bronze || []} />
        <SponsorsTier tier="backers" sponsors={backers || []} />
      </Container>
    </div>
  );
};

class Index extends React.Component {
  render() {
    const language = this.props.language || "en";

    return (
      <div>
        <script src="landing.js" />
        <HomeSplash language={language} />
        <div className="mainContainer landingContainer">
          <TldrSection language={language} />
          <SponsorsSection />
          <LanguagesSection />
          <EditorSupportSection />
          <UsersSection language={language} />
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  language: PropTypes.string,
};

module.exports = Index;
