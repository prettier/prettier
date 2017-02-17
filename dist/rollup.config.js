import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
  entry: 'src/cli.js',
  dest: 'dist/cli.prettier.dist.js',
  format: 'cjs',
  plugins: [
    json(),
    commonjs(),
    resolve(),
  ],
  useStrict: false,
  banner: '#!/usr/bin/env node',
  external: ['fs', 'readline', 'path', 'util', 'events', 'assert']
};
