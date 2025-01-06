import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import AnimatedLogo from "@sandhose/prettier-animated-logo";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import { useState } from "react";

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
    <div
      className={clsx("container", styles.tldrSection, styles.sectionPadding)}
    >
      <div className={styles.tldrSectionInner}>
        <div className={styles.tldrSectionColumn}>
          <h2>What is Prettier?</h2>
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
          <h2>Why?</h2>
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
      </div>
    </Layout>
  );
}
