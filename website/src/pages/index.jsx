import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import ColorModeSection from "../components/Homepage/ColorModeSection.jsx";
import EcosystemSection from "../components/Homepage/EcosystemSection.jsx";
import EditorSupportSection from "../components/Homepage/EditorSupportSection.jsx";
import HomepageHeader from "../components/Homepage/HomepageHeader.jsx";
import LanguagesSection from "../components/Homepage/LanguagesSection.jsx";
import SyntaxSection from "../components/Homepage/SyntaxSection.jsx";
import TldrSection from "../components/Homepage/TldrSection.jsx";
import UsersSection from "../components/Homepage/UsersSection.jsx";
import styles from "./index.module.css";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <div className="home">
      <Layout
        title="Prettier · Opinionated Code Formatter"
        description={siteConfig.tagline}
      >
        <main className={styles.page}>
          <HomepageHeader />
          <TldrSection />
          <SyntaxSection />
          <LanguagesSection />
          <EditorSupportSection />
          <UsersSection />
          <EcosystemSection />
          <ColorModeSection />
        </main>
      </Layout>
    </div>
  );
}
