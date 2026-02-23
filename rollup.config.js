import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/extension.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true
  },
  plugins: [typescript()]
};

