if (someVeryLongFunc(someVeryLongArgA, someVeryLongArgB, someVeryLongArgC, someVeryLongArgD)) { }

const radioSelectedAttr =
  (isAnyValueSelected &&
    node.getAttribute(radioAttr.toLowerCase()) === radioValue) ||
  ((!isAnyValueSelected && values[a].default === true) || a === 0);

function f() {
  if (position)
    return { name: pair };
  else
    return {
      name: pair.substring(0, position),
      value: pair.substring(position + 1)
    };
}


(foo || bar) || baz;
foo || (bar || baz);
foo || ((bar || baz) || qux);
foo || (bar || (baz || qux));
foo || (bar || ((baz || qux) || xyz));
foo || (bar || (baz || (qux || xyz)));
