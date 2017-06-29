"use strict";

const React = require("react");

const githubButton = (
  <a
    className="github-button"
    href="https://github.com/prettier/prettier"
    data-icon="octicon-star"
    data-count-href="/prettier/prettier/stargazers"
    data-count-api="/repos/prettier/prettier#stargazers_count"
    data-count-aria-label="# stargazers on GitHub"
    aria-label="Star this project on GitHub"
  >
    Star
  </a>
);

class Footer extends React.Component {
  render() {
    // const currentYear = new Date().getFullYear();
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            <img
              src={this.props.config.baseUrl + this.props.config.footerIcon}
              alt={this.props.config.title}
              width="66"
              height="58"
            />
          </a>
          <div>
            <h5>Docs</h5>
            <a
              href={
                this.props.config.baseUrl +
                "docs/" +
                this.props.language +
                "/why-prettier.html"
              }
            >
              Getting Started (or other categories)
            </a>
            <a
              href={
                this.props.config.baseUrl +
                "docs/" +
                this.props.language +
                "/why-prettier.html"
              }
            >
              Guides (or other categories)
            </a>
            <a
              href={
                this.props.config.baseUrl +
                "docs/" +
                this.props.language +
                "/why-prettier.html"
              }
            >
              API Reference (or other categories)
            </a>
          </div>
          <div>
            <h5>Community</h5>
            <a
              href={
                this.props.config.baseUrl + this.props.language + "/users.html"
              }
            >
              User Showcase
            </a>
            <a
              href="http://stackoverflow.com/questions/tagged/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stack Overflow
            </a>
            <a href="https://discordapp.com/">Project Chat</a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a href={this.props.config.baseUrl + "blog"}>Blog</a>
            <a href="https://github.com/">GitHub</a>
            {githubButton}
          </div>
        </section>
      </footer>
    );
  }
}

Footer.propTypes = {
  language: React.PropTypes.string,
  config: React.PropTypes.object
};

module.exports = Footer;
