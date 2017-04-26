import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
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
  ],
  useStrict: false,
  moduleName: 'prettier',
};
