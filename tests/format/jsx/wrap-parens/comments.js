// A leading comment keeps the wrapping parens even under "never"/"preserve":
// a `//` can't share a line with the `<` open tag, so unwrapping would force
// ASI after `return` and change semantics.

function leadingLineComment() {
  return (
    // leading
    <>
      <A />
    </>
  );
}

function leadingBlockComment() {
  return (
    /* leading */
    <>
      <A />
    </>
  );
}

// A trailing block comment on the element's own line prints inline (before the
// statement's semicolon), so the parens are kept to stay idempotent.
function trailingSameLineBlockComment() {
  return (
    <>
      <A />
    </> /* trailing */
  );
}

// Trailing line comments and own-line comments print as line suffixes (past
// the semicolon) and unwrap cleanly.
function trailingLineComment() {
  return (
    <>
      <A />
    </> // trailing
  );
}

function trailingOwnLineBlockComment() {
  return (
    <>
      <A />
    </>
    /* trailing */
  );
}

// Comments inside the tag (attributes, names, values) or in the children attach
// to descendant nodes, so they don't block stripping the optional parens.
function attributeComment() {
  return (
    <div
      // attr
      className="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    >
      <A />
    </div>
  );
}

function childComment() {
  return (
    <>
      {/* child */}
      <A />
    </>
  );
}
