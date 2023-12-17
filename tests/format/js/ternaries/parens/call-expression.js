// Callee
stopDirectory = (useCache
  ? memoizedFindProjectRoot
  : findProjectRootWithoutCache)(path.dirname(path.resolve(filePath)));

stopDirectory = (useCache
    ? memoizedFindProjectRoot
    : findProjectRootWithoutCache)?.(path.dirname(path.resolve(filePath)));

// Arguments
stopDirectory = findProjectRootWithoutCache(useCache
  ? memoizedFindProjectRoot
  : findProjectRootWithoutCache);

stopDirectory = findProjectRootWithoutCache?.(useCache
    ? memoizedFindProjectRoot
    : findProjectRootWithoutCache);

