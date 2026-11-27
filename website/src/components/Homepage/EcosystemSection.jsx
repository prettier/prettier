import ArrowLink from "./ArrowLink.jsx";
import Card from "./Card.jsx";
import styles from "./EcosystemSection.module.css";
import Section from "./Section.jsx";

// The dependents counts are updated by `scripts/update-dependents-count.js`
export default function EcosystemSection() {
  return (
    <Section title="Established in the Ecosystem" className={styles.ecosystem}>
      <ul className={styles.grid} role="list">
        <Card as="li" className={styles.stat}>
          <p className={styles.text}>
            Regularly used by more than <strong>86%</strong> of respondents to
            State of JS 2025, and more than 83% in 2021
          </p>
          <div className={styles.links}>
            <ArrowLink to="https://2025.stateofjs.com/en-US/other-tools/#utilities">
              State of JS 2025
            </ArrowLink>
            <ArrowLink to="https://2021.stateofjs.com/en-US/other-tools/#utilities">
              State of JS 2021
            </ArrowLink>
          </div>
        </Card>

        <Card as="li" className={styles.stat}>
          <img
            className={styles.image}
            src="/images/github_grey.svg"
            alt=""
            loading="lazy"
          />
          <p className={styles.text}>
            More than{" "}
            <strong data-placeholder="dependent-github">10.1 million</strong>{" "}
            dependent repositories on GitHub
          </p>
          <div className={styles.links}>
            <ArrowLink to="https://github.com/prettier/prettier/network/dependents">
              Check Them Out
            </ArrowLink>
          </div>
        </Card>

        <Card as="li" className={styles.stat}>
          <img
            className={styles.image}
            src="/images/npm_grey.svg"
            alt=""
            loading="lazy"
          />
          <p className={styles.text}>
            More than <strong data-placeholder="dependent-npm">20.5k</strong>{" "}
            dependent packages on npm
          </p>
          <div className={styles.links}>
            <ArrowLink to="https://www.npmjs.com/browse/depended/prettier">
              See them all
            </ArrowLink>
          </div>
        </Card>
      </ul>
    </Section>
  );
}
