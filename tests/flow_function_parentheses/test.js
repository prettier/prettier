type Banana = {
  eat: string => boolean,
};

type Hex = {n: 0x01};

type T = { method: (a) => void };

type T = { method(a): void };

declare class X { method(a): void }

declare function f(a): void;

var f: (a) => void;

interface F { m(string): number }

interface F { m: (string) => number }

function f(o: { f: (string) => void }) {}

function f(o: { f(string): void }) {}

type f = (...arg) => void;

type f = (/* comment */ arg) => void;

type f = (arg /* comment */) => void;

type f = (?arg) => void;

class X {
  constructor(
    ideConnectionFactory: child_process$ChildProcess => FlowIDEConnection =
        defaultIDEConnectionFactory,
  ) {
  }
}

interface F {
  ideConnectionFactoryLongLongLong: (child_process$ChildProcess) => FlowIDEConnection
}

type ExtractType = <A>(B<C>) => D
