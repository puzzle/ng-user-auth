const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const pkg = require('../package.json');
const commonConfig = require('./webpack.common.js');
const OptimizeJsPlugin = require('optimize-js-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

const ENV = process.env.NODE_ENV = process.env.ENV = 'prod';

// jshint -W106
module.exports = webpackMerge(commonConfig({ env: ENV }), {
  plugins: [

    new OptimizeJsPlugin({
      sourceMap: false
    }),

    new UglifyJsPlugin({
      beautify: false,
      output: {
        comments: false
      }, //prod
      mangle: {
        screw_ie8: true
      }, //prod
      compress: {
        screw_ie8: true,
        warnings: false,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        negate_iife: false // we need this for lazy v8
      }
    }),

    new webpack.BannerPlugin({
      banner: [
        'ng-user-auth ', pkg.version, '\n',
        '(c) ', (new Date()).getFullYear(), ' ', pkg.author, '\n',
        'License: ', pkg.license,
      ].join(''),
      entryOnly: true,
      include: 'ng-user-auth.min.js'
    }),
  ]
});
