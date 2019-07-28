h(
  "div",
  { className: "whatever" },
  h("button", null, "OK"),
  h("button", null, "Cancel")
);
// Inline object would be nice to group too.

h(
  Fragment,
  // No props.
  null,
  h("button", null, "OK"),
  h("button", null, "Cancel")
);

h(
  "div",
  null,
  h(
    "button",
    {
      className: "whatever",
      onClick: ev => {
        ev.preventDefault();
        console.log(ev.target);
      }
    },
    "OK"
  )
);
// Curly brace and props indent still irk me.

h(
  "How will this behave, I want to see a very long string here and test the result",
  { className: "whatever" },
  h("button", null, "OK"),
  h("button", null, "Cancel")
);
// Well I tried.
