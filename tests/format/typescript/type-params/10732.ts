const isNodeOrTokenOfTypeWithConditions = <
  NodeOrTokenType extends (NodeOrToken extends TSESTree.Node ? AST_NODE_TYPES : AST_TOKEN_TYPES),
>() => true;
