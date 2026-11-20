import styles from "./ColorModeSection.module.css";
import ColorModeSelector from "./ColorModeSelector.jsx";
import Container from "./Container.jsx";

export default function ColorModeSection() {
  return (
    <div className={styles.colorModeSection}>
      <Container>
        <ColorModeSelector />
      </Container>
    </div>
  );
}
