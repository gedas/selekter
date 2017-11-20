import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import postcss from 'rollup-plugin-postcss';
import tsc from 'typescript';
import pkg from './package.json';

const dev = !!process.env.ROLLUP_WATCH;

let plugins = [
  typescript({ typescript: tsc }),
  resolve(),
  postcss({ extract: 'dist/selekter.css' })
];

if (dev) {
  plugins.push(...[
    serve(['dist', 'app']),
    livereload()
  ]);
} else {
  plugins.push(uglify({}, minify));
}

export default {
  input: './src/index.ts',
  output: [
    { file: pkg.main, format: 'umd' },
    { file: pkg.module, format: 'es' }
  ],
  name: 'selekter',
  plugins
}