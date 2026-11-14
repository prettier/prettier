import Heading from "@theme/Heading";
import styles from "./CardTitle.module.css";

/**
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export default function CardTitle({ children }) {
  return (
    <Heading as="h3" className={styles.cardTitle}>
      {children}
    </Heading>
  );
}
