const stopDirectory = await (useCache
  ? memoizedFindProjectRoot
  : findProjectRootWithoutCache)(path.dirname(path.resolve(filePath)));

const stopDirectory2 = await (useCache
  ? memoizedFindProjectRoot
  : findProjectRootWithoutCache)?.(path.dirname(path.resolve(filePath)));

const projectRootFinder = new (
  useCache ? MemoizedProjectRoot : ProjectRootFinder
)();
