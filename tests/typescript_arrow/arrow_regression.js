const bar = (...varargs:any[]) => {
  console.log(varargs);
};

const foo = (x:string):void => (
  bar(
    x,
    () => {},
    () => {}
  )
);
