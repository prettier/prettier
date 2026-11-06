import Link from "@docusaurus/Link";
import ArrowIcon from "./ArrowIcon.jsx";
import Button from "./Button.jsx";
import Section from "./Section.jsx";
import styles from "./SyntaxSection.module.css";

export default function SyntaxSection() {
  return (
    <Section>
      <Link
        to="https://sentry.shop/products/syntax-prettier-tee"
        className={styles.promo}
      >
        <img
          className={styles.image}
          src="/images/syntaxfm/1.webp"
          alt=""
          width={2000}
          height={529}
          loading="lazy"
          decoding="async"
        />
        <span className={styles.content}>
          <span>
            <span className={styles.title}>
              Limited edition T-shirts are now available to buy!
            </span>
            <span className={styles.text}>
              $10 per T-shirt goes to maintain the project.
            </span>
          </span>
          <Button variant="primary">
            Get yours
            <ArrowIcon />
          </Button>
        </span>
      </Link>
    </Section>
  );
}
