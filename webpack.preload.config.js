const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/preload.ts',
  target: 'electron-preload',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: false,
            compilerOptions: {
              module: 'commonjs'
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.d.ts'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  output: {
    filename: 'preload.js',
    path: path.resolve(__dirname, 'dist')
  }
};
