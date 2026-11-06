import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import LanguageItem from "./LanguageItem.jsx";
import styles from "./LanguagesSection.module.css";
import Section from "./Section.jsx";

/**
@typedef {{
  name: string,
  nameLink?: string,
  image: string,
  variants: string[],
}} Language
*/

export default function LanguagesSection() {
  const { siteConfig } = useDocusaurusContext();

  /** @type {Language[]} */
  const languages = siteConfig.customFields.supportedLanguages;

  return (
    <Section
      title="Works with the Tools You Use"
      alternate
      className={styles.languages}
    >
      <ul className={styles.grid} role="list">
        {languages.map((language) => (
          <LanguageItem key={language.name} {...language} />
        ))}
      </ul>
    </Section>
  );
}
