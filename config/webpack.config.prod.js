'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
const shouldUseRelativeAssetPaths = publicPath === './';
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

const cssFilename = 'static/css/[name].[contenthash:8].css';

module.exports = {
  mode: 'production',
  bail: true,
  devtool: shouldUseSourceMap ? 'source-map' : false,
  entry: {
    app: [require.resolve('./polyfills'), paths.appIndexJs],
    content: [require.resolve('./polyfills'), paths.appContentJs],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new webpack.optimize.TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
        sourceMap: shouldUseSourceMap,
      }),
    ],
    splitChunks: {
      chunks: 'all',
      name: false,
    },
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`,
    },
  },
  output: {
    path: paths.appBuild,
    filename: 'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    publicPath: publicPath,
    clean: true,
  },
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
    alias: {
      'react-native': 'react-native-web',
    },
    plugins: [
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
    ],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint'),
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: paths.appSrc,
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/, /\.wav$/],
            type: 'asset/resource',
            generator: {
              filename: 'static/media/[name].[hash:8][ext]',
            },
          },
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              customize: require.resolve('babel-preset-react-app/webpack-overrides'),
              presets: [
                [
                  require.resolve('@babel/preset-env'),
                  {
                    targets: {
                      browsers: ['>0.2%', 'not dead', 'not op_mini all'],
                    },
                  },
                ],
                [
                  require.resolve('@babel/preset-react'),
                  {
                    runtime: 'automatic',
                  },
                ],
              ],
              plugins: [
                [
                  require.resolve('babel-plugin-transform-class-properties'),
                  { loose: true },
                ],
              ],
              cacheDirectory: true,
              cacheCompression: true,
              compact: true,
            },
          },
          {
            test: /\.css$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: Array(cssFilename.split('/').length)
                    .join('../')
                    .replace(/\\/g, '/'),
                },
              },
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  sourceMap: shouldUseSourceMap,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  postcssOptions: {
                    ident: 'postcss',
                    plugins: () => [
                      require('postcss-flexbugs-fixes'),
                      autoprefixer({
                        flexbox: 'no-2009',
                      }),
                    ],
                  },
                  sourceMap: shouldUseSourceMap,
                },
              },
            ],
          },
          {
            test: /\.(ttf|eot|woff|woff2)$/,
            type: 'asset/resource',
            generator: {
              filename: 'static/fonts/[name].[hash:8][ext]',
            },
          },
          {
            loader: require.resolve('file-loader'),
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: cssFilename,
      chunkFilename: cssFilename,
    }),
    new WebpackManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.[\w]{8}\./,
      filename: 'service-worker.js',
      logger(message) {
        if (message.messageType === 'old-cache-deleted') {
          return;
        }
        if (message.messageType === 'unexpected-event') {
          console.warn(
            'SWPrecacheWebpackPlugin: ' + message.message
          );
        }
      },
      minify: true,
      navigateFallback: publicUrl + '/index.html',
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\./locale$/,
      contextRegExp: /moment$/,
    }),
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  performance: {
    hints: false,
  },
};
