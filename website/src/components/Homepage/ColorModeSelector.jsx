import { useColorMode } from "@docusaurus/theme-common";
import useIsBrowser from "@docusaurus/useIsBrowser";
import IconDarkMode from "@theme/Icon/DarkMode";
import IconLightMode from "@theme/Icon/LightMode";
import IconSystemColorMode from "@theme/Icon/SystemColorMode";
import { useId } from "react";
import { flushSync } from "react-dom";
import styles from "./ColorModeSelector.module.css";

const colorModes = [
  { value: "light", label: "Light", Icon: IconLightMode },
  { value: "dark", label: "Dark", Icon: IconDarkMode },
  { value: "system", label: "System", Icon: IconSystemColorMode },
];

export default function ColorModeSelector() {
  const { colorModeChoice, setColorMode } = useColorMode();
  const isBrowser = useIsBrowser();
  const labelId = useId();
  const selected = colorModeChoice ?? "system";

  /**
   *
   * @param {string} value
   */
  const onChange = (value) => {
    const update = () => setColorMode(value === "system" ? null : value);

    if (
      !document.startViewTransition ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      update();
      return;
    }

    // Cross-fade the page between the old and the new color mode
    document.startViewTransition(() => flushSync(update));
  };

  return (
    <div className={styles.colorModeSelector}>
      <span id={labelId} className={styles.label}>
        Theme
      </span>
      <div
        className={styles.options}
        role="radiogroup"
        aria-labelledby={labelId}
      >
        {colorModes.map(({ value, label, Icon }) => (
          <label key={value} className={styles.option}>
            <input
              type="radio"
              name="color-mode"
              value={value}
              checked={selected === value}
              disabled={!isBrowser}
              onChange={() => onChange(value)}
              className={styles.input}
            />
            <span className={styles.optionContent}>
              <Icon aria-hidden="true" className={styles.icon} />
              {label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
