import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Admonition from "@theme/Admonition";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";
import styles from "./index.module.css";

export default function Users() {
  const { siteConfig } = useDocusaurusContext();
  const { users } = siteConfig.customFields;

  const showcase = users.map((user) => (
    <div key={user.caption} className={styles.logoItem}>
      <Link to={user.infoLink}>
        <img src={user.image} title={user.caption} />
      </Link>
    </div>
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
                <Link to="https://2021.stateofjs.com/en-US/other-tools/#utilities">
                  More than <strong>83%</strong> of respondents to State of JS
                  2021 (10282 developers out of 12360).
                </Link>
              </li>
              <li>
                <Link to="https://2020.stateofjs.com/en-US/other-tools/#utilities">
                  More than <strong>70%</strong> of respondents to State of JS
                  2020 (14880 developers out of 20974).
                </Link>
              </li>
            </ul>
          </Admonition>

          <section>
            <div className={styles.logoGrid}>{showcase}</div>
            <div className="text--center margin-bottom--lg">
              ...and{" "}
              <Link to="https://www.npmjs.com/browse/depended/prettier">
                many more projects
              </Link>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
