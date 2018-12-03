import typescript from 'rollup-plugin-typescript';
import { uglify } from 'rollup-plugin-uglify';

const isDev = !!process.env.ROLLUP_WATCH;

let plugins = [
  typescript()
];

if (!isDev) {
  plugins.push(uglify());
}

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/web.js',
      name: 'selekter',
      format: 'umd'
    }
  ],
  plugins
}