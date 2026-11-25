//     10|       20|       30|       40|       50|       60|       70|       80|
const sortByCreatedAsc: AgentSortOptionsFn = (a: AiAgent, b: AiAgent): number =>
  true ? a : b;

const sortByCreatedAs1: AgentSortOptionsFn = (a: AiAgent, b: AiAgent): value =>
  true ? a : b;

const sortByCreatedAs2: AgentSortOptionsFn = (a: AiAgent, b: AiAgent): boolean =>
  true ? a : b;

const sortByCreatedAs3: AgentSortOptionsFn = (a: AiAgent, b: AiAgent): number =>
  ident;
