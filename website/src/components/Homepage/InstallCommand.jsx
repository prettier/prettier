import IconCopy from "@theme/Icon/Copy";
import IconSuccess from "@theme/Icon/Success";
import { Fragment, useEffect, useRef, useState } from "react";
import styles from "./InstallCommand.module.css";

const installCommand = "npm install --save-dev --save-exact prettier";

export default function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const commandRef = useRef(null);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
    } catch {
      // Clipboard access can be denied, select the command to copy it manually
      getSelection().selectAllChildren(commandRef.current);
    }
  };

  return (
    <div className={styles.installCommand}>
      <code className={styles.text}>
        <span className={styles.prompt} aria-hidden="true">
          $
        </span>{" "}
        <span ref={commandRef}>
          {/* Only wrap between words, never at the hyphens of the flags */}
          {installCommand.split(" ").map((word, index) => (
            <Fragment key={word}>
              {index > 0 && " "}
              <span className={styles.word}>{word}</span>
            </Fragment>
          ))}
        </span>
      </code>
      <button
        type="button"
        className={styles.copyButton}
        onClick={copy}
        aria-label="Copy install command"
        title="Copy install command"
      >
        {copied ? (
          <IconSuccess aria-hidden="true" />
        ) : (
          <IconCopy aria-hidden="true" />
        )}
      </button>
      <span className={styles.visuallyHidden} role="status">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
