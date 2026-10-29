import Link from "@docusaurus/Link";
import clsx from "clsx";
import styles from "./Button.module.css";

/**
 * A link styled as a button. Without `to`, only the style is rendered, e.g.
 * for the call to action inside a card that is a link itself.
 *
 * @param {object} props
 * @param {"primary" | "secondary"} props.variant
 * @param {string} [props.to]
 * @param {string} [props.target]
 * @param {React.ReactNode} props.children
 */
export default function Button({ variant, to, target, children }) {
  const className = clsx(styles.button, styles[variant]);

  if (!to) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link className={className} to={to} target={target}>
      {children}
    </Link>
  );
}
