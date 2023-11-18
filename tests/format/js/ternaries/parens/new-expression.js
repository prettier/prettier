projectRootFinder = new (
  useCache ? MemoizedProjectRoot_longer_longer_longer_longer : ProjectRootFinder_longer_longer_longer_longer
)();

projectRootFinder = new (
  ProjectRootFinder
)(useCache
    ? memoizedFindProjectRoot_longer_longer_longer_longer
    : findProjectRootWithoutCache_longer_longer_longer_longer);
