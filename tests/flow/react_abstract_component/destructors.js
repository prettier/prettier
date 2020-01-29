//@flow

const React = require('react');

declare var C: React$AbstractComponent<{foo?: number, bar: number}, void>;

// Create element tests props_to_tin
const _a = <C bar={3} />;
const _b = <C baz={3} />; // Error, bar missing

// ElementRef tests get_instance

(undefined: React$ElementRef<typeof C>);
(3 : React$ElementRef<typeof C>); // Error, 3 is not void.

// ElementConfig tests get_defaults and props_to_tout

({foo: 3, bar: 3}: React$ElementConfig<typeof C>);
({bar: 3}: React$ElementConfig<typeof C>);
({foo: 3, bar: 3, baz: 3}: React$ElementConfig<typeof C>);
({baz: 3}: React$ElementConfig<typeof C>); // Error, bar missing
