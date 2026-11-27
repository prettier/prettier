import AnimatedLogo from "@sandhose/prettier-animated-logo";
import { useState } from "react";
import styles from "./DraggableLogo.module.css";

export default function DraggableLogo() {
  const [rolling, setRolling] = useState(false);

  /**
   *
   * @param {DragEvent} event
   */
  const onDragStart = (event) => {
    event.preventDefault();
    setRolling(true);
  };

  return (
    <div
      className={styles.logo}
      draggable="true"
      onDragStart={onDragStart}
      onTouchStart={() => setRolling(true)}
    >
      <AnimatedLogo
        version="wide"
        rolling={rolling}
        onAnimationEnd={() => setRolling(false)}
        aria-hidden="true"
      />
    </div>
  );
}
