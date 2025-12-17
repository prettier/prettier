import Collapsible from "../ui/Collapsible.jsx";

export default function SidebarCategory({ title }, { slots }) {
  const children = slots.default();
  return (
    <Collapsible title={title} defaultOpen={true}>
      {children}
    </Collapsible>
  );
}
