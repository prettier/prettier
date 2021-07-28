/** @type {import('somemodule').Config} */
export default ({
  rollup: config => ({
    ...config,
    test: 'me'
  }),
});
