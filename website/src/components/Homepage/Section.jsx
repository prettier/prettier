import Heading from "@theme/Heading";
import clsx from "clsx";
import Container from "./Container.jsx";
import styles from "./Section.module.css";

/**
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {boolean} [props.alternate] Use the alternate background
 * @param {React.ReactNode} [props.footer]
 * @param {string} [props.className] Can set `--section-accent`, the color of
 * the stroke above the title
 * @param {React.ReactNode} props.children
 */
export default function Section({
  title,
  alternate = false,
  footer,
  className,
  children,
}) {
  return (
    <section
      className={clsx(styles.section, alternate && styles.alternate, className)}
    >
      <Container>
        {title && (
          <Heading as="h2" className={styles.title}>
            {title}
          </Heading>
        )}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </Container>
    </section>
  );
}
