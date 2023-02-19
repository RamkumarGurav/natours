/* eslint-disable*/
const path = require('path'); //including the path package
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, 'public/js/index.js'),
  },
  mode: 'development',
  devtool: 'source-map',
  output: {
    //output file
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].js',
  },

  devServer: {
    static: {
      directory: path.resolve(__dirname, 'public/js'),
    },
    compress: true,
    port: 9000,
    hot: true,
    open: true,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPugPlugin({
      filename: 'base.pug', //main html template
      template: './views/base.pug',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.pug$/,
        use: {
          loader: 'pug-plain-loader',
        },
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
};
