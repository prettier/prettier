{
  label: (call() /* after the call */);
}

const value = (
  // outside a labeled statement
  { value: true }
);

{
  label: call(
    // inside the call
    { value: true },
  );
}
