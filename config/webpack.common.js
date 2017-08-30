const path = require('path');
const webpack = require('webpack');
const pkg = require('../package.json');
const OptimizeJsPlugin = require('optimize-js-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

const wpModules = {
  loaders: [
    {
      test: /\.js$/,
      use: [{
        loader: 'ng-annotate-loader'
      }, {
        loader: 'babel-loader',
        options: {
          presets: [
            ['es2015', { loose: true }]
          ]
        }
      }],
      exclude: /node_modules/
    },
  ]
};

const wpExternals = {
  angular: {
    commonjs: 'angular',
    root: 'angular',
  },
  'angular-local-storage': {
    commonjs: 'angular-local-storage',
    root: 'null',
  },
  'angular-ui-router': {
    commonjs: 'angular-ui-router',
    root: 'null',
  },
  jquery: {
    commonjs: 'jquery',
    root: 'jQuery',
  },
  lodash: {
    commonjs: 'lodash',
    root: '_',
  },
};

const wpPlugins = [

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
    include: ['ng-user-auth.min.js', 'ng-user-auth.node.min.js']
  }),
];

const libConfig = {
  target: 'node',

  entry: {
    'ng-user-auth': './src/ngUserAuth.module.js',
  },

  devtool: 'source-map',

  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: '[name].node.min.js',
    libraryTarget: 'commonjs'
  },

  module: wpModules,
  externals: wpExternals,
  plugins: wpPlugins,
};

const webConfig = {
  entry: {
    'ng-user-auth': './src/ngUserAuth.module.js',
  },

  devtool: 'source-map',

  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: '[name].min.js',
    libraryTarget: 'umd',
  },

  module: wpModules,
  externals: wpExternals,
  plugins: wpPlugins,
};

module.exports = [libConfig, webConfig];
