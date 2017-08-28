const helpers = require('./helpers');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

const ENV = process.env.NODE_ENV = process.env.ENV = 'test';

module.exports = webpackMerge(commonConfig({ env: ENV }), {
  devtool: 'inline-source-map',

  resolve: {
    extensions: ['.js'],
    modules: [helpers.root('src'), 'node_modules']
  },

  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        presets: [
          ['es2015', { loose: true }]
        ]
      },
      exclude: /node_modules/
    }, {
      enforce: 'post',
      test: /\.js$/,
      loader: 'istanbul-instrumenter-loader',
      include: helpers.root('src'),
      query: {
        esModules: true
      },
      exclude: [/node_modules/, /spec\.js/]
    }]
  },
});
