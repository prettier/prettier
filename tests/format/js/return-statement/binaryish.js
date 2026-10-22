async function* f() {
  return (
    property.isIdentifier() &&
     FUNCTIONS[property.node.name] &&
     (object.isIdentifier(JEST_GLOBAL) ||
       (callee.isMemberExpression() && shouldHoistExpression(object))) &&
    FUNCTIONS[property.node.name](expr.get('arguments'))
  );
  yield (
    property.isIdentifier() &&
     FUNCTIONS[property.node.name] &&
     (object.isIdentifier(JEST_GLOBAL) ||
       (callee.isMemberExpression() && shouldHoistExpression(object))) &&
    FUNCTIONS[property.node.name](expr.get('arguments'))
  );
  throw (
    property.isIdentifier() &&
     FUNCTIONS[property.node.name] &&
     (object.isIdentifier(JEST_GLOBAL) ||
       (callee.isMemberExpression() && shouldHoistExpression(object))) &&
    FUNCTIONS[property.node.name](expr.get('arguments'))
  );
  await (
    property.isIdentifier() &&
     FUNCTIONS[property.node.name] &&
     (object.isIdentifier(JEST_GLOBAL) ||
       (callee.isMemberExpression() && shouldHoistExpression(object))) &&
    FUNCTIONS[property.node.name](expr.get('arguments'))
  );

  return (
    chalk.bold(
      'No tests found related to files changed since last commit.\n',
    ) +
    chalk.dim(
      patternInfo.watch ?
        'Press `a` to run all tests, or run Jest with `--watchAll`.' :
        'Run Jest without `-o` to run all tests.',
    )
  );
  yield (
    chalk.bold(
      'No tests found related to files changed since last commit.\n',
    ) +
    chalk.dim(
      patternInfo.watch ?
        'Press `a` to run all tests, or run Jest with `--watchAll`.' :
        'Run Jest without `-o` to run all tests.',
    )
  );
  throw (
    chalk.bold(
      'No tests found related to files changed since last commit.\n',
    ) +
    chalk.dim(
      patternInfo.watch ?
        'Press `a` to run all tests, or run Jest with `--watchAll`.' :
        'Run Jest without `-o` to run all tests.',
    )
  );
  await (
    chalk.bold(
      'No tests found related to files changed since last commit.\n',
    ) +
    chalk.dim(
      patternInfo.watch ?
        'Press `a` to run all tests, or run Jest with `--watchAll`.' :
        'Run Jest without `-o` to run all tests.',
    )
  );

  return !filePath.includes(coverageDirectory) &&
    !filePath.endsWith(`.${SNAPSHOT_EXTENSION}`);
  yield !filePath.includes(coverageDirectory) &&
    !filePath.endsWith(`.${SNAPSHOT_EXTENSION}`);
  throw !filePath.includes(coverageDirectory) &&
    !filePath.endsWith(`.${SNAPSHOT_EXTENSION}`);
  await !filePath.includes(coverageDirectory) &&
    !filePath.endsWith(`.${SNAPSHOT_EXTENSION}`);
}
