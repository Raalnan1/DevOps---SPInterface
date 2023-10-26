const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  "mode": "production",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false, // Note `mangle: false`
          compress: false, // Note `compress: false`
          output: {
            beautify: true, // Note `beautify: true`
          },
        },
      }),
    ],
  },
  entry: './app/ts/SPInterface.ts', // your main TypeScript file
  output: {
      filename: 'SPInterface.js',
    path: path.resolve(__dirname, 'dist'), // output directory
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    jquery: 'jQuery', // assuming jQuery is global
    isotope: 'Isotope', // assuming Isotope is global
    bootstrap: 'bootstrap' // assuming Bootstrap is global
  },
};
