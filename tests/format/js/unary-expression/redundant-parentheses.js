function remove(window) {
  delete (/** @type {any} */ window).__pwned;
  delete (/* comment */ window).__pwned;
  delete /* comment */ window.__pwned;
  delete (/* comment */ window.__pwned);
  delete ((/* comment */ window)).__pwned;
  delete (/* comment */ window)?.__pwned;
}

typeof (/* comment */ object).property;
void (/* comment */ factory)();
!(/* comment */ object).property;
+(/* comment */ factory)();
-(/* comment */ object).method();
~(/* comment */ tag)`template`;
!(/* comment */ object.method)();
!((/* comment */ value)++);
!((/* comment */ left) + right);
!((/* comment */ left) || right);
!(/* comment */ new Factory()).property;
delete (/* comment */ factory()).property;
!((/* comment */ object).property).another;

delete (
  // comment
  object
).property;

// These inner comments must not introduce parentheses around the whole operand.
delete object[/* comment */ property];
typeof object./* comment */property;
void factory(/* comment */ argument);

// Required grouping is not redundant parentheses.
!(/* comment */ (() => {}))();
delete (/* comment */ (left || right)).property;
