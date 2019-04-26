const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const CopyPlugin = require('copy-webpack-plugin');

const DESTINATION = path.resolve( __dirname, 'devdist' );

module.exports = merge(common, {
  output: {
    path: DESTINATION
  },
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