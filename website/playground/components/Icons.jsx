import darkLogo from "../assets/prettier-icon-dark.svg";
import lightLogo from "../assets/prettier-icon-light.svg";
import { theme } from "../composables/theme";

export const PrettierLogo = () => (
  <img src={theme.value === "dark" ? darkLogo : lightLogo} alt="Prettier" />
);

export const DarkIcon = ({ width = 16, height = 16 }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} aria-hidden="true">
    <path
      fill="currentColor"
      d="M9.37 5.51a7.4 7.4 0 009.12 9.12A7 7 0 119.37 5.51M12 3a9 9 0 108.9 7.64 5.39 5.39 0 01-9.8-3.14 5.4 5.4 0 012.26-4.4Q12.69 3 12 3"
    />
  </svg>
);

export const LightIcon = ({ width = 16, height = 16 }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 9a1 1 0 0 1 0 6 1 1 0 0 1 0-6m0-2a5 5 0 1 0 0 10 5 5 0 0 0 0-10M2 13h2a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2m18 0h2a1 1 0 0 0 0-2h-2a1 1 0 0 0 0 2M11 2v2a1 1 0 0 0 2 0V2a1 1 0 0 0-2 0m0 18v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-2 0M5.99 4.58a1 1 0 1 0-1.41 1.41l1.06 1.06a1 1 0 1 0 1.41-1.41zm12.37 12.37a1 1 0 1 0-1.41 1.41l1.06 1.06a1 1 0 1 0 1.41-1.41zm1.06-10.96a1 1 0 1 0-1.41-1.41l-1.06 1.06a1 1 0 1 0 1.41 1.41zM7.05 18.36a1 1 0 1 0-1.41-1.41l-1.06 1.06a1 1 0 1 0 1.41 1.41z"
    />
  </svg>
);

export const GitHubIcon = ({ width = 16, height = 16 }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
    />
  </svg>
);

export const CheckIcon = ({ width = 10, height = 10 }) => (
  <svg
    fill="currentColor"
    width={width}
    height={height}
    viewBox="0 0 10 10"
    aria-hidden="true"
  >
    <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
  </svg>
);

export const ChevronUpDownIcon = ({ width = 8, height = 12 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 8 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path d="M0.5 4.5L4 1.5L7.5 4.5" />
    <path d="M0.5 7.5L4 10.5L7.5 7.5" />
  </svg>
);

export const ChevronIcon = ({ width = 10, height = 10, class: className }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    class={className}
    aria-hidden="true"
  >
    <path d="M3.5 9L7.5 5L3.5 1" />
  </svg>
);

export const LoadingIcon = ({ width = 16, height = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
  >
    <g
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    >
      <path
        stroke-dasharray="16"
        stroke-dashoffset="16"
        d="M12 3c4.97 0 9 4.03 9 9"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.3s"
          values="16;0"
        />
        <animateTransform
          attributeName="transform"
          dur="1.5s"
          repeatCount="indefinite"
          type="rotate"
          values="0 12 12;360 12 12"
        />
      </path>
      <path
        stroke-dasharray="64"
        stroke-dashoffset="64"
        stroke-opacity=".3"
        d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="1.2s"
          values="64;0"
        />
      </path>
    </g>
  </svg>
);
