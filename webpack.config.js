const path = require('path');
const webpack = require('webpack');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: '3dWebParser',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [
          '/node_modules/',
          '/pkg/',
        ]
      },
    ],
  },
  externals: [nodeExternals()],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.wasm' ],
  },
  mode: 'development'
};
