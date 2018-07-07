function build(format) {
  return {
    input: 'src/index.js',
    external: ['applet'],
    output: {
      globals: {
        applet: 'Applet'
      },
      file: `dist/${format}.js`,
      format,
      name: 'netop'
    }
  }
}

export default [
  build('umd'),
  build('esm'),
  build('cjs'),
];