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

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Prettier · Opinionated Code Formatter"
      description="Description will go into a meta tag in <head />"
    >
      <div className="home">
        <HomepageHeader />
        <main>asd</main>
      </div>
    </Layout>
  );
}
