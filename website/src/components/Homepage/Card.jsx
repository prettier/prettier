import clsx from "clsx";
import styles from "./Card.module.css";

/**
 *
 * @param {object} props
 * @param {React.ElementType} [props.as]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Card({ as: Element = "div", className, children }) {
  return <Element className={clsx(styles.card, className)}>{children}</Element>;
}
