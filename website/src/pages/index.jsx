import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import AnimatedLogo from "@sandhose/prettier-animated-logo";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import { useState } from "react";
import Markdown from "react-markdown";

const playgroundLink =
  process.env.NODE_ENV === "production"
    ? "pathname:///playground/"
    : "http://localhost:5173/";

function DraggableLogo() {
  const [rolling, setRolling] = useState(false);

  /**
   *
   * @param {DragEvent} event
   */
  const onDragStart = (event) => {
    event.preventDefault();
    setRolling(true);
  };

  return (
    <div
      className={styles.logoWrapper}
      draggable="true"
      onDragStart={onDragStart}
      onTouchStart={onDragStart}
    >
      <AnimatedLogo
        version="wide"
        rolling={rolling}
        onAnimationEnd={() => setRolling(false)}
      />
    </div>
  );
}

function Tidelift() {
  const { siteConfig } = useDocusaurusContext();
  const tideliftUrl = siteConfig.customFields.tideliftUrl;

  return (
    <Link className={styles.tidelift} to={tideliftUrl}>
      PRETTIER FOR ENTERPRISE
    </Link>
  );
}

function HomepageHeader() {
  return (
    <header className={clsx("hero hero--dark", styles.heroBanner)}>
      <Tidelift />

      <div className="container">
        <div className={styles.logoWrapperContainer}>
          <DraggableLogo />
        </div>
        <div className={styles.heroButtonContainer}>
          <Link
            className={clsx(
              "button button--primary button--lg",
              styles.heroButton,
            )}
            to={playgroundLink}
            target="_self"
          >
            Try It Online
          </Link>
          <Link
            className={clsx(
              "button button--secondary button--lg",
              styles.heroButton,
            )}
            to="/docs/install"
          >
            Install Prettier
          </Link>
        </div>
      </div>
    </header>
  );
}

function SyntaxSection() {
  return (
    <section className={styles.syntaxSection}>
      <Link
        to="https://sentry.shop/products/syntax-prettier-tee"
        className={clsx(styles.syntaxLink, "container")}
      >
        <div className="margin-bottom--md">
          Limited edition tshirts are now available to buy! $10 per tshirt goes
          to maintain the project.
        </div>
        <img width={860} alt="" src="/images/syntaxfm/1.webp" />
      </Link>
    </section>
  );
}

function TldrSection() {
  return (
    <div className={clsx(styles.tldrSection, styles.sectionPadding)}>
      <div className={clsx("container", styles.tldrSectionInner)}>
        <div className={styles.tldrSectionColumn}>
          <Heading as="h2">What is Prettier?</Heading>
          <ul>
            <li>An opinionated code formatter</li>
            <li>Supports many languages</li>
            <li>Integrates with most editors</li>
            <li>
              <a href={"/docs/option-philosophy"}>Has few options &raquo;</a>
            </li>
          </ul>
        </div>
        <div className={styles.tldrSectionColumn}>
          <Heading as="h2">Why?</Heading>
          <ul>
            <li>Your code is formatted on save</li>
            <li>No need to discuss style in code review</li>
            <li>Saves you time and energy</li>
            <li>
              <Link to={"/docs/why-prettier"}>And more &raquo;</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function LanguagesSection() {
  const { siteConfig } = useDocusaurusContext();
  const languages = siteConfig.customFields.supportedLanguages;

  const languageChunks = languages.reduce((acc, language) => {
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
  }, []);

  return (
    <section className={clsx(styles.sectionPadding, styles.languageSection)}>
      <div className="container">
        <Heading as="h2">Works with the Tools You Use</Heading>
        <div className={styles.languageSectionGrid}>
          {languageChunks.map((languageChunk, index) => (
            <div key={index}>
              {languageChunk.map((language) => (
                <LanguageItem key={language.name} {...language} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string?} props.nameLink
 * @param {string} props.image
 * @param {string[]} props.variants
 */
function LanguageItem({ name, nameLink, image, variants }) {
  return (
    <div className={styles.languageItem}>
      <img src={image} className={styles.languageItemImage} alt="" />
      <ul className={styles.languageItemList}>
        <li>{nameLink ? <a href={nameLink}>{name}</a> : name}</li>

        {variants.map((variant) => (
          <li key={variant}>
            <Markdown>{variant}</Markdown>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditorSupportSection() {
  const { siteConfig } = useDocusaurusContext();
  const editors = siteConfig.customFields.editors;
  const githubUrl = siteConfig.customFields.githubUrl;

  return (
    <div className={clsx(styles.sectionPadding, styles.editorSection)}>
      <div className="container">
        <Heading as="h2">Editor Support</Heading>
        <div className={styles.editorSectionGrid}>
          {editors.map((editor) => (
            <Editor key={editor.name} {...editor} />
          ))}
        </div>

        <div className={styles.editorSectionButtonContainer}>
          <div>
            <span className="margin-right--sm">Got more?</span>
            <Link
              to={`${githubUrl}/edit/main/website/data/editors.yml`}
              className={clsx("button button--outline button--primary")}
            >
              Send a PR
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 *
 * @param {object} props
 * @param {string} props.content
 * @param {string} props.image
 * @param {string} props.name
 */
function Editor({ content = "", image, name }) {
  return (
    <div className={styles.editorItem}>
      <img src={image} className={styles.editorItemImage} alt="" />
      <div>
        <Heading as="h3">{name}</Heading>
        <Markdown>{content.replaceAll("\n", "  \n")}</Markdown>
      </div>
    </div>
  );
}

function UsersSection() {
  const { siteConfig } = useDocusaurusContext();
  const users = siteConfig.customFields.users;
  const showcase = users
    .filter((user) => user.pinned)
    .map((user, i) => (
      <a key={i} href={user.infoLink} className={styles.userItem}>
        <img
          src={user.greyImage}
          title={user.caption}
          className={styles.userItemImage}
        />
      </a>
    ));

  return (
    <div className={clsx(styles.sectionPadding, styles.userSection)}>
      <div className="container padding-bottom--md">
        <Heading as="h2">Used By People You Rely On</Heading>
        <div className={styles.userSectionGrid}>{showcase}</div>
        <div className={styles.userSectionButtonContainer}>
          <div>
            <Link to="/users" className={clsx("button button--primary")}>
              See others
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <Heading as="h2">Established in the Ecosystem</Heading>

        <div className={styles.ecosystemGrid}>
          <div className={styles.ecosystemGridItem}>
            <Link
              to="https://2021.stateofjs.com/en-US/other-tools/utilities"
              style={{ marginTop: "15px" }}
              aria-label="Statistic for utility tools in the State of JavaScript survey"
            >
              <img src="/images/state_of_js_grey.svg" alt="" />
            </Link>
            <div>
              <p>Regularly used by:</p>
              <ul>
                <li>
                  <Link to="https://2021.stateofjs.com/en-US/other-tools/#utilities">
                    More than 83% of respondents to State of JS 2021.
                  </Link>
                </li>
                <li>
                  <Link to="https://2020.stateofjs.com/en-US/other-tools/#utilities">
                    More than 70% of respondents to State of JS 2020.
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.ecosystemGridItem}>
            <Link
              to="https://github.com/prettier/prettier"
              aria-label="Prettier on GitHub"
            >
              <img src="/images/github_grey.svg" alt="" />
            </Link>
            <div>
              <p>
                More than{" "}
                <strong data-placeholder="dependent-github">9.2 million</strong>{" "}
                dependent repositories on GitHub
              </p>
              <Link
                className="button button--primary"
                to="https://github.com/prettier/prettier/network/dependents"
              >
                Check Them Out
              </Link>
            </div>
          </div>

          <div className={styles.ecosystemGridItem}>
            <Link
              to="https://npmjs.com/package/prettier"
              aria-label="Prettier on NPM"
            >
              <img src="/images/npm_grey.svg" alt="" />
            </Link>
            <div>
              <p>
                More than{" "}
                <strong data-placeholder="dependent-npm">19.2k</strong>{" "}
                dependent packages on npm
              </p>
              <Link
                className="button button--primary"
                to="https://www.npmjs.com/browse/depended/prettier"
                aria-label="See every dependent npm packages"
              >
                See them all
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <div className="home">
      <Layout
        title="Prettier · Opinionated Code Formatter"
        description={siteConfig.tagline}
      >
        <HomepageHeader />
        <SyntaxSection />
        <TldrSection />
        <LanguagesSection />
        <EditorSupportSection />
        <UsersSection />
      </Layout>
    </div>
  );
}
