const merge = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    'synthetic_main': './synthetic_main.ts',
    'test_main': './test_main',
  },
  plugins: [
    new CopyPlugin([
      { from: 'res', to: 'res' },
    ]),
  ],
});