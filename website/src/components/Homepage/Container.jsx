import styles from "./Container.module.css";

/**
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export default function Container({ children }) {
  return <div className={styles.container}>{children}</div>;
}
