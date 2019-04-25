const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    'synthetic_main': './synthetic_main.ts',
    'test_main': './test_main.ts',
  },
  plugins: [
    new CopyPlugin([
      { from: 'res', to: 'res' },
      { from: 'test.html', to: 'test.html'}
    ]),
  ],
});