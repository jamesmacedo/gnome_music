import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: ['src/extension.ts', 'src/extension_test.ts'],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true
  },
  external: [
    /^gi:\/\//,
    /^resource:\/\//
  ],
  plugins: [
    resolve({
      browser: true 
    }),
    commonjs(),
    typescript(),
    copy({
      targets: [
        { src: 'src/style/stylesheet.css', dest: 'dist/' },
        { src: 'metadata.json', dest: 'dist/' },
      ]
    }),
    babel({ 
      babelHelpers: 'bundled',
      exclude: 'node_modules/core-js/**'
    })
  ]
};

