const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');

module.exports = {
  mode: 'development',
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
      electron: false
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/renderer')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        IS_TEST: JSON.stringify(process.env.NODE_ENV === 'test')
      },
      __TEST__: JSON.stringify(process.env.NODE_ENV === 'test'),
      __DEBUG__: JSON.stringify(true),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      chunks: ['renderer'],
      inject: true,
      scriptLoading: 'blocking',
      minify: false,
      templateParameters: {
        isTest: process.env.NODE_ENV === 'test'
      }
    })
  ],
  devServer: {
    client: {
      overlay: false, // Disable overlay during tests to prevent interference
      logging: 'info', // Show more logs during tests
      progress: true // Enable progress updates for debugging
    },
    devMiddleware: {
      writeToDisk: true,
      stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
      }
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      let isCompiled = false;
      devServer.compiler.hooks.done.tap('TestSetup', () => {
        isCompiled = true;
      });

      devServer.app.get('/__webpack_ready', (_, response) => {
        response.json({ ready: isCompiled });
      });

      return middlewares;
    },
    hot: false, // Disable hot module replacement for tests
    liveReload: false, // Disable live reload for tests
    watchFiles: {
      paths: ['src/**/*', 'public/**/*', 'test-assets/**/*'],
      options: {
        usePolling: false // Disable polling to reduce CPU usage
      }
    },
    static: [
      {
        directory: path.join(__dirname, 'dist/renderer'),
        watch: false
      },
      {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
        serveIndex: true,
        watch: false
      },
      {
        directory: path.join(__dirname, 'test-assets'),
        publicPath: '/test-assets',
        serveIndex: true,
        watch: false
      }
    ],
    port: 8083,
    host: 'localhost',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization, Range',
      'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges'
    }
  }
};
