class Route {
  static +param: T;
}

class ReadonlyRoute {
    static   readonly   param: T;
}

type ReadonlyObj = {
    readonly   foo:   string,
  readonly [string]:   unknown
};

type ReadonlyTuple = [  readonly   label:   number  ];

type ReadonlyInterface = interface {
      readonly   prop:   string
};

type ReadonlyReservedWords = {
  readonly   with:   string,
  readonly   default?:   string,
  readonly   enum:   number,
  readonly   new:   boolean,
};
