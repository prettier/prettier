import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ArrowIcon from "./ArrowIcon.jsx";
import styles from "./Tidelift.module.css";

export default function Tidelift() {
  const { siteConfig } = useDocusaurusContext();
  const { tideliftUrl } = siteConfig.customFields;

  return (
    <Link className={styles.tidelift} to={tideliftUrl}>
      <span className={styles.icon} aria-hidden="true" />
      Prettier for Enterprise
      <ArrowIcon className={styles.arrow} />
    </Link>
  );
}
