const path = require('path');
const webpack = require('webpack');

module.exports = function () {

  return {

    entry: {
      'ng-user-auth': './src/ngUserAuth.module.js',
    },

    devtool: 'source-map',

    output: {
      path: path.join(__dirname, '..', 'dist'),
      filename: '[name].min.js',
      sourceMapFilename: '[name].[chunkhash].map',
      chunkFilename: '[id].[chunkhash].chunk.js',
      library: 'ngUserAuth'
    },

    module: {
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
    },

    plugins: [

      new webpack.ProvidePlugin({
        'window.jQuery': 'jquery',
      }),
    ]
  };
};
