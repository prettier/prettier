function getTypeParametersFromTypeReference(node) {
  let typeArguments;
  switch (node.type) {
    case "GenericTypeAnnotation":
      typeArguments = node.typeParameters;
      break;
    case "TSTypeReference":
      typeArguments = node.typeArguments;
      break;
  }
  return typeArguments?.params;
}

export { getTypeParametersFromTypeReference };
