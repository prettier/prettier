export default function SidebarWrapper({ visible }, { slots }) {
  const children = slots.default();
  return (
    <div
      class={`playground__sidebar ${visible ? "playground__sidebar--open" : ""}`}
    >
      <div class="playground__sidebar-content">{children}</div>
    </div>
  );
}
