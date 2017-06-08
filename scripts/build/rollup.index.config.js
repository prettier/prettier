import baseConfig from './rollup.base.config.js';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default Object.assign(baseConfig, {
  entry: 'index.js',
  dest: 'dist/index.js',
  format: 'cjs',
  plugins: [json(), resolve({ preferBuiltins: true }), commonjs()],
  external: ['assert'],
});
