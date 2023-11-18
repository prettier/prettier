projectRootFinder = new (
  useCache ? MemoizedProjectRoot : ProjectRootFinder
)();

projectRootFinder = new (
  ProjectRootFinder
)(useCache
    ? memoizedFindProjectRoot
    : findProjectRootWithoutCache);
