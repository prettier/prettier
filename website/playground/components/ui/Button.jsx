export default function Button({ variant, link, icon }, { slots, attrs }) {
  return link ? (
    <a
      class={[
        "button",
        "button--link",
        icon && "button__icon",
        variant === "primary" && "button--primary",
        variant === "danger" && "button--danger",
      ]}
      {...attrs}
    >
      {slots.default()}
    </a>
  ) : (
    <button
      type="button"
      class={[
        "button",
        icon && "button__icon",
        variant === "primary" && "button--primary",
        variant === "danger" && "button--danger",
      ]}
      {...attrs}
    >
      {slots.default()}
    </button>
  );
}

Button.props = {
  variant: { type: String },
  link: { type: Boolean, default: false },
  icon: { type: Boolean, default: false },
};
