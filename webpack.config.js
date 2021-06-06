
// Specify separate paths
const path = require('path');
const APP_DIR = path.resolve(__dirname, './src');
const MONACO_DIR = path.resolve(__dirname, './node_modules/monaco-editor');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
module.exports = {
  plugins: [
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ['json']
    })
  ],
  rules: [{
    test: /\.css$/,
    include: APP_DIR,
    use: [{
      loader: 'style-loader',
    }, {
      loader: 'css-loader',
      options: {
        modules: true,
        namedExport: true,
      },
    }],
  }, {
    test: /\.css$/,
    include: MONACO_DIR,
    use: ['style-loader', 'css-loader'],
  }],
};