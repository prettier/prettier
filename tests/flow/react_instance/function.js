// @flow

declare var any: any;

function Foo(props: {}) {}

(any: React$ElementRef<typeof Foo>).nope; // Error
