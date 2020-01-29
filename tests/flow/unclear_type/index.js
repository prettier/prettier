// @flow strict

const a: any = 5;

const b: number = 999;

const c: Object = {a: 5};

const d: Function = () => 0;

const e: () => any = () => 0;

const f: (Object) => Function = ({}) => function() {};

type f2 = <T: Object>(x: T) => T;

// malformed types should not also be unclear
(null: Object<mixed>);
(null: Function<mixed>);
