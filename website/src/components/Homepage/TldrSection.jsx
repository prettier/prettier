import Heading from "@theme/Heading";
import ArrowLink from "./ArrowLink.jsx";
import Card from "./Card.jsx";
import Section from "./Section.jsx";
import styles from "./TldrSection.module.css";

export default function TldrSection() {
  return (
    <Section>
      <div className={styles.grid}>
        <Card className={styles.card}>
          <Heading as="h2" className={styles.title}>
            What is Prettier?
          </Heading>
          <ul className={styles.list}>
            <li>An opinionated code formatter</li>
            <li>Supports many languages</li>
            <li>Integrates with most editors</li>
            <li>
              <ArrowLink to="/docs/option-philosophy">
                Has few options
              </ArrowLink>
            </li>
          </ul>
        </Card>
        <Card className={styles.card}>
          <Heading as="h2" className={styles.title}>
            Why?
          </Heading>
          <ul className={styles.list}>
            <li>Your code is formatted on save</li>
            <li>No need to discuss style in code review</li>
            <li>Saves you time and energy</li>
            <li>
              <ArrowLink to="/docs/why-prettier">And more</ArrowLink>
            </li>
          </ul>
        </Card>
      </div>
    </Section>
  );
}
