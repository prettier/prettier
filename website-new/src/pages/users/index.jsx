import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Heading from "@theme/Heading";
import Admonition from "@theme/Admonition";
import styles from "./index.module.css";
import clsx from "clsx";

export default function Users() {
  const { siteConfig } = useDocusaurusContext();
  const users = siteConfig.customFields.users;

  const showcase = users.map((user, i) => (
    <a key={i} href={user.infoLink} className={styles.logoItem}>
      <img src={user.image} title={user.caption} />
    </a>
  ));

  return (
    <Layout title="Who's using Prettier?">
      <main className={clsx("margin-vert--xl", styles.main)}>
        <div className="container">
          <Heading as="h1" className="text--center">
            Who’s Using This?
          </Heading>

          <Admonition
            type="info"
            title="Prettier is regularly used by:"
            className="margin-vert--lg"
          >
            <ul>
              <li>
                <a href="https://2021.stateofjs.com/en-US/other-tools/#utilities">
                  More than <strong>83%</strong> of respondents to State of JS
                  2021 (10282 developers out of 12360).
                </a>
              </li>
              <li>
                <a href="https://2020.stateofjs.com/en-US/other-tools/#utilities">
                  More than <strong>70%</strong> of respondents to State of JS
                  2020 (14880 developers out of 20974).
                </a>
              </li>
            </ul>
          </Admonition>

          <section>
            <div className={styles.logoGrid}>{showcase}</div>
            <div className="text--center margin-bottom--lg">
              ...and{" "}
              <a href="https://www.npmjs.com/browse/depended/prettier">
                many more projects
              </a>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
