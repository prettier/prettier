run_spec(__dirname, {parser: 'babylon'});

/**
 * TS currently broken
 * 
 * - expression.js potential future JS bind syntax (::) was added which is not supported by TypeScript
 */
// run_spec(__dirname, {parser: 'typescript'});
