export function Sidebar({ visible }, { slots }) {
  return (
    <div class={`options-container ${visible ? "open" : ""}`}>
      <div class="options">{slots.default?.()}</div>
    </div>
  );
}

export function SidebarCategory({ title }, { slots }) {
  return (
    <details class="sub-options" open>
      <summary>{title}</summary>
      {slots.default?.()}
    </details>
  );
}
