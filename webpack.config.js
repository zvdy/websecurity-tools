const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: ['./src/index.tsx']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      components: path.resolve(__dirname, 'src/components/'),
      utils: path.resolve(__dirname, 'src/utils/'),
      pages: path.resolve(__dirname, 'src/pages/'),
    },
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "process": require.resolve("process/browser"),
      "vm": false
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    // Add polyfill plugins
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    // Add definitions
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
  },
};