const helpers = require('./helpers');
const webpack = require('webpack');
const commonConfig = require('./webpack.common.js');

const config = commonConfig[1];
config.devtool = 'inline-source-map';
config.resolve = {
  extensions: ['.js'],
  modules: [helpers.root('src'), 'node_modules']
};
config.module = {
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
};
config.plugins = [
  new webpack.ProvidePlugin({
    'window.jQuery': 'jquery'
  }),
];
config.externals = {};

module.exports = config;
