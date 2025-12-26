record Empty {}

record Basic {
  foo: string,
  default: boolean = false,
  42: number,
  'one-two': string,
  2n: bigint,
}

record DefaultValueParens {
  foo: number = (1, 2),
}

/**
 * It's a record.
 */
record Comments {
  /**
   * A string property.
   */
  foo: string,
  /**
   * A boolean property.
   */
  bar: boolean = false,
}

record CommentsEmpty {
  // Comment
}

export default record ExportDefault {
  a: number,
}

export record ExportNamed {
  a: number,
}

record Targs<T> {
  foo: T,
  bar: boolean = false,
  class: string,
}

record Implements implements Iface {
  foo: string,
}

record ImplementsMany<T> implements Iface, OtherIface<T> {
  foo: T,
}

record Methods {
  foo: string,

  equals(other: string) {
    return this.foo === other;
  }

  f_tparams<T>() {}

  static f_static(): void {}

  async f_async() {}

  *f_generator() {}

  async *f_async_generator() {}

  static *f_static_generator() {}

  static async f_static_async() {}

  static async *f_all() {}
}

record Static {
  static foo: string = "",
  static bar: boolean = false,
  static 42: number = 0,
  static 'one-two': string = '',
  static 2n: bigint = 0n,
}
