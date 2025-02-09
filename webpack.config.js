const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    renderer: './src/renderer/index.tsx'
  },
  target: 'web',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.renderer.json'
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(mp4|wav)$/,
        type: 'asset/resource',
        generator: {
          filename: 'media/[name][ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    fallback: {
      fs: false,
      path: false,
      electron: false,
      process: require.resolve('process/browser')
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/renderer')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      chunks: ['renderer']
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    })
  ],
  devServer: {
    client: {
      overlay: false // Disable overlay during tests to prevent interference
    },
    watchFiles: {
      paths: ['src/**/*', 'public/**/*', 'test-assets/**/*'],
      options: {
        usePolling: true
      }
    },
    static: [
      {
        directory: path.join(__dirname, 'dist/renderer')
      },
      {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
        serveIndex: true,
        watch: true
      },
      {
        directory: path.join(__dirname, 'test-assets'),
        publicPath: '/',
        serveIndex: true,
        watch: true
      },
      {
        directory: path.join(__dirname, 'cypress'),
        publicPath: '/',
        serveIndex: true,
        watch: true
      }
    ],
    port: 8084,
    hot: true,
    devMiddleware: {
      writeToDisk: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization, Range',
      'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges'
    }
  }
};
