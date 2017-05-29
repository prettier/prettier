import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-replace';
import uglify from 'uglify-es';

const parser = process.env.parser;

export default {
  entry: 'src/parser-' + parser + '.js',
  dest: 'dist/src/parser-' + parser + '.js',
  format: 'cjs',
  plugins: [
    parser === 'typescript' ? replace({
      'exports\.Syntax =': '1,',
      include: 'node_modules/typescript-eslint-parser/parser.js',
    }) : {},
    json(),
    resolve(),
    commonjs(),
    {
      transformBundle(code) {
        const result = uglify.minify(code, {});
        if (result.error) throw result.error;
        return result;
      }
    }
  ],
  external: ['fs', 'buffer', 'path', 'module', 'assert', 'util', 'os', 'crypto'],
  useStrict: parser === "flow" ? false : true,
};

