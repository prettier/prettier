function bareReturn() {
  return <>
    <SomeElement />
    <SomeOtherElement />
  </>;
}

function parenReturn() {
  return (
    <>
      <SomeElement />
      <SomeOtherElement />
    </>
  );
}

function bareReturnElement() {
  return <div>
    <SomeElement />
    <SomeOtherElement />
  </div>;
}

function throwJsx() {
  throw <div>
    <SomeElement />
    <SomeOtherElement />
  </div>;
}

const bareArrow = () => <>
  <SomeElement />
  <SomeOtherElement />
</>;

const parenArrow = () => (
  <>
    <SomeElement />
    <SomeOtherElement />
  </>
);

const bareAssign = <>
  <SomeElement />
  <SomeOtherElement />
</>;

const parenAssign = (
  <>
    <SomeElement />
    <SomeOtherElement />
  </>
);

// Parens are syntactically required here and must be kept regardless of option.
const mapped = (
  <div>
    <SomeElement />
    <SomeOtherElement />
  </div>
).map((x) => x);
