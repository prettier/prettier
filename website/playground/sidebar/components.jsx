export function Sidebar({ visible }, { slots }) {
  const children = slots.default();
  return (
    <div class={`options-container ${visible ? "open" : ""}`}>
      <div class="options">{children}</div>
    </div>
  );
}

export function SidebarCategory({ title }, { slots }) {
  const children = slots.default();
  return (
    <details class="sub-options" open>
      <summary>{title}</summary>
      {children}
    </details>
  );
}
