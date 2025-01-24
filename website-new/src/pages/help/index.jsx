import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import Heading from "@theme/Heading";

/**
 *
 * @param {object} props
 * @param {string} props.title
 * @param {ReactNode} props.children
 */
function Card({ title, children }) {
  return (
    <div class="card margin-vert--sm">
      <div class="card__header">
        <h2>{title}</h2>
      </div>
      <div class="card__body">
        <p>{children}</p>
      </div>
    </div>
  );
}

export default function Help() {
  return (
    <Layout title="Prettier · Opinionated Code Formatter">
      <main className="margin-vert--xl container">
        <div className="margin-bottom--lg">
          <Heading as="h1">Need help?</Heading>
          <div>This project is maintained by a dedicated group of people;</div>
        </div>

        <div className="row">
          <div className="col">
            <Card title="Browse Docs">
              Learn more using the{" "}
              <Link to="/docs">documentation on this site</Link>.
            </Card>
          </div>
          <div className="col">
            <Card title="Join the community">
              Ask questions about the documentation and project.
            </Card>
          </div>
          <div className="col">
            <Card title="Stay up to date">
              Find out what's new with this project.
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
}
