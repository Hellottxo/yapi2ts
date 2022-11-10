const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    background: path.join(srcDir, 'background.js'),
    content_script: path.join(srcDir, 'content_script.js'),
    interceptor: path.join(__dirname, "../src/core/index.js")
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js"],
    modules: ["node_modules"],
    fallback: {
      buffer: require.resolve("buffer/")
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [{
        from: ".",
        to: "../",
        context: "public"
      }],
      options: {},
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
    })
  ],
};