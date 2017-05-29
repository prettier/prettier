import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
  entry: 'index.js',
  dest: 'dist/index.js',
  format: 'cjs',
  plugins: [
    json(),
    resolve(),
    commonjs(),
  ],
  external: ['assert'],
};
