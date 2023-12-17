// Callee
projectRootFinder = new (
  useCache ? MemoizedProjectRoot_longer_longer_longer_longer : ProjectRootFinder_longer_longer_longer_longer
)();

// Arguments
projectRootFinder = new (
  ProjectRootFinder
)(useCache
    ? memoizedFindProjectRoot_longer_longer_longer_longer
    : findProjectRootWithoutCache_longer_longer_longer_longer);
