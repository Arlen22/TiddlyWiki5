const path = require('path');

module.exports = {
  entry: {
    // "source-map-support": path.resolve(__dirname, './node_modules/source-map-support/register.js'),
    // "boot-closure-full": path.resolve(__dirname, './boot/boot.js'),
    "boot-webpack-full": path.resolve(__dirname, './boot/boot.js')
    // "morgan": require.resolve("morgan")
    // "wss": path.resolve(__dirname, './node_modules/ws/index.js')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname),
    library: "[name]",
    libraryTarget: "commonjs2"
  },
  node: {
    __dirname: true,
    __filename: true
  },
  target: 'node',
  mode: "production",
  externals: {
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil'
  }
};