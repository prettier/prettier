module Y3 {
  public module Module {
      class A { s: string }
  }

  // Apparently this parses :P
  export private public protected static readonly abstract async enum X { }

  interface x {
      export private static readonly [x: any]: any;
  }
}
