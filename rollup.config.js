import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy'

export default {
  input: 'src/extension.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    typescript(),
    copy({
      targets: [
        { src: 'src/style/stylesheet.css', dest: 'dist/' },
        { src: 'metadata.json', dest: 'dist/' },
      ]
    })
  ]
};

