import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-replace';

const parser = process.env.parser;

export default {
  entry: 'bin/prettier.js',
  dest: 'dist/bin/prettier.js',
  format: 'cjs',
  banner: '#!/usr/bin/env node',
  plugins: [
    replace({
      '#!/usr/bin/env node': ''
    }),
    json(),
    resolve(),
    commonjs(),
  ],
  external: ['fs', 'readline', 'path', 'module', 'assert', 'util', 'events'],
};
