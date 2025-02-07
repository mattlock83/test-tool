const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'bundle.js', // The bundled file
    path: path.resolve(__dirname, 'dist'),
    // Use a relative publicPath in production if needed.
    publicPath: isProduction ? './' : '/',
    clean: true
  },
  module: {
    rules: [
      // Transpile JavaScript and JSX using Babel.
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
      // JSON files are handled natively by Webpack.
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: isProduction
    })
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 3000,
    open: true
  }
};
