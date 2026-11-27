import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Button from "./Button.jsx";
import Section from "./Section.jsx";
import styles from "./UsersSection.module.css";

export default function UsersSection() {
  const { siteConfig } = useDocusaurusContext();
  const { users } = siteConfig.customFields;
  const showcase = users
    .filter((user) => user.pinned)
    .map((user) => (
      <li key={user.caption}>
        <a href={user.infoLink} className={styles.userItem}>
          <img
            src={user.greyImage}
            title={user.caption}
            alt={user.caption}
            className={styles.userItemImage}
            loading="lazy"
          />
        </a>
      </li>
    ));

  return (
    <Section
      title="Used By People You Rely On"
      alternate
      className={styles.users}
      footer={
        <Button variant="secondary" to="/users">
          See others
        </Button>
      }
    >
      <ul className={styles.grid} role="list">
        {showcase}
      </ul>
    </Section>
  );
}
