import Heading from "@theme/Heading";
import Button from "./Button.jsx";
import Container from "./Container.jsx";
import DraggableLogo from "./DraggableLogo.jsx";
import FormattingExample from "./FormattingExample.jsx";
import styles from "./HomepageHeader.module.css";
import InstallCommand from "./InstallCommand.jsx";
import Tidelift from "./Tidelift.jsx";

const playgroundLink =
  process.env.NODE_ENV === "production"
    ? "pathname:///playground/"
    : "http://localhost:5173/";

export default function HomepageHeader() {
  return (
    <header className={styles.hero}>
      <Container>
        <Tidelift />
        <DraggableLogo />
        <Heading as="h1" className={styles.title}>
          Prettier
        </Heading>
        <p className={styles.lead}>
          Prettier enforces a consistent style by parsing your code and
          re-printing it with its own rules that take the maximum line length
          into account.
        </p>
        <div className={styles.buttons}>
          <Button variant="primary" to={playgroundLink} target="_self">
            Try It Online
          </Button>
          <Button variant="secondary" to="/docs/install">
            Install Prettier
          </Button>
        </div>
        <InstallCommand />
        <FormattingExample />
      </Container>
    </header>
  );
}
