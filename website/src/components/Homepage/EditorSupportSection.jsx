import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ArrowLink from "./ArrowLink.jsx";
import Editor from "./Editor.jsx";
import styles from "./EditorSupportSection.module.css";
import Section from "./Section.jsx";

export default function EditorSupportSection() {
  const { siteConfig } = useDocusaurusContext();
  const { editors, githubUrl } = siteConfig.customFields;

  return (
    <Section
      title="Editor Support"
      className={styles.editors}
      footer={
        <>
          Got more?{" "}
          <ArrowLink to={`${githubUrl}/edit/main/website/data/editors.yml`}>
            Send a PR
          </ArrowLink>
        </>
      }
    >
      <ul className={styles.grid} role="list">
        {editors.map((editor) => (
          <Editor key={editor.name} {...editor} />
        ))}
      </ul>
    </Section>
  );
}
