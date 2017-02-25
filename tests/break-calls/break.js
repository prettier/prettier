h(f(g(() => {
  a
})))

deepCopyAndAsyncMapLeavesA(
  { source: sourceValue, destination: destination[sourceKey] },
  { valueMapper, overwriteExistingKeys }
)

deepCopyAndAsyncMapLeavesB(
  1337,
  { source: sourceValue, destination: destination[sourceKey] },
  { valueMapper, overwriteExistingKeys }
)

deepCopyAndAsyncMapLeavesC(
  { source: sourceValue, destination: destination[sourceKey] },
  1337,
  { valueMapper, overwriteExistingKeys }
)
