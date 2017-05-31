import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';

const filepath = process.env.filepath;
const filename = filepath.replace(/.+\//, '');
const basename = filename.replace(/\..+/, '');

export default {
  entry: 'dist/' + filepath,
  dest: 'docs/' + filename,
  format: 'iife',
  plugins: [
    json(),
    resolve(),
    commonjs(),
    globals(),
  ],
  useStrict: false,
  moduleName: basename.replace(/.+-/, ''),
  external: ['assert', 'fs', 'module']
};
