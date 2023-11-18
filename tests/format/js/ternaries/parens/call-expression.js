// Callee
stopDirectory = (useCache
  ? memoizedFindProjectRoot_longer_longer_longer_longer
  : findProjectRootWithoutCache_longer_longer_longer_longer)(path.dirname(path.resolve(filePath)));

stopDirectory = (useCache
    ? memoizedFindProjectRoot_longer_longer_longer_longer
    : findProjectRootWithoutCache_longer_longer_longer_longer)?.(path.dirname(path.resolve(filePath)));

// Arguments
stopDirectory = findProjectRootWithoutCache(useCache
  ? memoizedFindProjectRoot_longer_longer_longer_longer
  : findProjectRootWithoutCache_longer_longer_longer_longer)();

stopDirectory = findProjectRootWithoutCache?.(useCache
    ? memoizedFindProjectRoot_longer_longer_longer_longer
    : findProjectRootWithoutCache_longer_longer_longer_longer);

// Shortter
const stopDirectory2 = await (useCache
  ? memoizedFindProjectRoot
  : findProjectRootWithoutCache)(path.dirname(path.resolve(filePath)));

stopDirectory = (useCache
  ? memoizedFindProjectRoot
  : findProjectRootWithoutCache)(path.dirname(path.resolve(filePath)));
