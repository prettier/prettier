import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import AnimatedLogo from "@sandhose/prettier-animated-logo";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import { useState } from "react";
import Markdown from "react-markdown";

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
            to="pathname:///playground.html"
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
        <div>
          Limited edition tshirts are now available to buy! $10 per tshirt goes
          to maintain the project.
        </div>
        <img width={860} src="/images/syntaxfm/1.webp" />
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
      <img src={image} />
      <ul>
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

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Prettier · Opinionated Code Formatter"
      description={siteConfig.tagline}
    >
      <div className="home">
        <HomepageHeader />
        <SyntaxSection />
        <TldrSection />
        <LanguagesSection />
      </div>
    </Layout>
  );
}
