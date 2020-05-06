// @flow

declare var x: ?string;

//flowlint-next-line sketchy-null:error
if (x) { } // This should be an error

if (x) { } // This should be a warning
