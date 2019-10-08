const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

function resolve(dir) {
}

module.exports = {
    entry: './index.js',
    devServer: {
      compress: true,
      contentBase: path.join(__dirname, 'public'),
      stats: 'minimal',
      host: 'localhost',
      https: true,
      open: false,
      overlay: {
        warnings: false, // reports errors in browser window
        errors: true,
      },
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, ".")
        }),
        // Have this example work in Edge which doesn't ship `TextEncoder` or
        // `TextDecoder` at this time.
        new webpack.ProvidePlugin({
          TextDecoder: ['text-encoding', 'TextDecoder'],
          TextEncoder: ['text-encoding', 'TextEncoder']
        })
    ],
    mode: 'development',
    //mode: 'production'
};
