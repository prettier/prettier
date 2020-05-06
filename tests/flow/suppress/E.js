// It's possible to suppress a lint error with a normal suppression comment, but
// a suppression comment over a lint which was never enabled should not be
// considered "used." Instead, it should show up as an unused suppression.

// Note: this test assumes that sketchy-null-string is never explicitly enabled

declare var x: ?string;
// $FlowFixMe - this is unused because sketchy-null-string is off
if (x) {}
