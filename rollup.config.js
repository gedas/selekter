import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import copy from 'rollup-plugin-copy';
import tsc from 'typescript';
import pkg from './package.json';

const dev = !!process.env.ROLLUP_WATCH;

let plugins = [
  copy({ 'src/selekter.css': 'dist/selekter.css' }),
  typescript({ typescript: tsc }),
  resolve()
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