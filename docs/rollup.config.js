import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import babili from 'rollup-plugin-real-babili';
import json from 'rollup-plugin-json';

export default {
  entry: 'index.js',
  dest: 'docs/prettier.min.js',
  format: 'iife',
  plugins: [
    json(),
    resolve(),
    commonjs(),
    globals(),
    builtins(),
    babili({comments: false, sourceMap: false}),
  ],
  useStrict: false,
  moduleName: 'prettier',
};
