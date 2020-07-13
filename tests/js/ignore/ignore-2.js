// #8736

function HelloWorld() {
  return (
    <div
      {...{} /*
      // @ts-ignore */ /* prettier-ignore */}
      invalidProp="HelloWorld"
    >
      test
    </div>
  );
}
