import Link from "@docusaurus/Link";
import ArrowIcon from "./ArrowIcon.jsx";
import styles from "./ArrowLink.module.css";

/**
 *
 * @param {object} props
 * @param {string} props.to
 * @param {React.ReactNode} props.children
 */
export default function ArrowLink({ to, children }) {
  return (
    <Link to={to} className={styles.arrowLink}>
      {children}
      <ArrowIcon className={styles.arrow} />
    </Link>
  );
}
