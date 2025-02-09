const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/renderer/test-entry.tsx',
  output: {
    path: path.resolve(__dirname, 'cypress/fixtures'),
    filename: 'media-bin-bundle.js',
    library: {
      name: ['MediaBin', 'MediaBinContext'],
      type: 'window'
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    }
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'logger': 'window.logger'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
