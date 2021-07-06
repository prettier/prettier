function StatelessFunctionalComponent4({
  isActive,
  onFiltersUpdated,
  onSelect,
  onSubmitAndDeselect,
  onCancel,
  searchFilters,
  title,
  items,
}: MyType | null | void) {
  return <div />
}

const StatelessFunctionalComponent5 = ({
  isActive,
  onFiltersUpdated,
  onSelect,
  onSubmitAndDeselect,
  onCancel,
  searchFilters,
  title,
  items,
}: {
  isActive: number,
  onFiltersUpdated: number,
  onSelect: number,
  onSubmitAndDeselect: number,
  onCancel: number,
  searchFilters: number,
  title: number,
  items: number,
}) => {
  return <div />
};

type T = ({
  isActive: number,
  onFiltersUpdated: number,
  onSelect: number,
  onSubmitAndDeselect: number,
  onCancel: number,
  searchFilters: number,
  title: number,
  items: number,
}) => void;

const X = (props: {
  a: boolean,
}) =>
  <A />;
