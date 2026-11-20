import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import styles from "./Markdown.module.css";

/**
 * Markdown from the files in `website/data/`
 *
 * @param {object} props
 * @param {string} props.children
 * @param {boolean} [props.inline] Render without the surrounding paragraph
 * @param {string} [props.className]
 */
export default function Markdown({ children, inline = false, className }) {
  const Element = inline ? "span" : "div";

  return (
    <Element className={clsx(styles.markdown, className)}>
      <ReactMarkdown disallowedElements={inline ? ["p"] : []} unwrapDisallowed>
        {children}
      </ReactMarkdown>
    </Element>
  );
}
