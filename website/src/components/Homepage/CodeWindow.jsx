import clsx from "clsx";
import { Highlight } from "prism-react-renderer";
import styles from "./CodeWindow.module.css";

// Tokens are colored by `.code` in `CodeWindow.module.css` to match the page theme
const codeTheme = { plain: {}, styles: [] };

/**
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.code
 * @param {boolean} [props.formatted]
 */
export default function CodeWindow({ title, code, formatted = false }) {
  return (
    <figure className={clsx(styles.codeWindow, formatted && styles.formatted)}>
      <figcaption className={styles.title}>{title}</figcaption>
      <Highlight code={code} language="javascript" theme={codeTheme}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className={styles.code} tabIndex={0}>
            <code>
              {tokens.map((line, lineIndex) => (
                <span key={lineIndex} {...getLineProps({ line })}>
                  {line.map((token, tokenIndex) =>
                    token.empty ? null : (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ),
                  )}
                  {"\n"}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </figure>
  );
}
