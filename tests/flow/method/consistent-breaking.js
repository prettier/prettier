class Foo1 {
  flowParseFunctionTypeParams(
    params: N.FlowFunctionTypeParam[] = [],
  ): { params: N.FlowFunctionTypeParam[], rest: ?N.FlowFunctionTypeParam } {
    // ...
  }
}

type Foo2 = {
  flowParseFunctionTypeParams(
    params: N.FlowFunctionTypeParam[]
  ): { params: N.FlowFunctionTypeParam[], rest: ?N.FlowFunctionTypeParam }
}

{
  function flowParseFunctionTypeParams(
    params: N.FlowFunctionTypeParam[]
  ): { params: N.FlowFunctionTypeParam[], rest: ?N.FlowFunctionTypeParam } {
    // ...
  }
}
