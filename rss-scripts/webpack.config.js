const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const __ = (d) => d ?? __dirname;

const getEntryPoint = (projectDir) => fs.existsSync(path.join(projectDir, 'src', 'index.ts'))
  ? './index.ts'
  : './index.js';

const getTsConfigPath = (projectDir) => {
  const projectTsConfigPath = path.join(projectDir, 'tsconfig.json');
  return fs.existsSync(projectTsConfigPath)
    ? projectTsConfigPath
    : path.resolve(__dirname, './tsconfig.json');
};

const devServer = (isDev) => !isDev ? {} : {
  devServer: {
    open: true,
    port: 5050,
  },
};

module.exports = ({ development, dirname }) => ({
  mode: development ? 'development' : 'production',
  devtool: development ? 'inline-source-map' : false,
  entry: getEntryPoint(__(dirname)),
  context: path.join(__(dirname), 'src'),
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.join(__(dirname), 'dist'),
    assetModuleFilename: '[file]',
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        loader: require.resolve('ts-loader'),
        options: {
          configFile: getTsConfigPath(__(dirname)),
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|svg|webp)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(?:mp3|wav|ogg|mp4)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[contenthash].css' }),
    new HtmlWebpackPlugin({ template: './index.html' }),
    new CopyPlugin({
      patterns: [
        {
          from: '**/*',
          context: path.resolve(__(dirname), './src'),
          globOptions: {
            ignore: [
              '**/*.js',
              '**/*.ts',
              '**/*.scss',
              '**/*.sass',
              '**/*.html',
            ],
          },
          noErrorOnMissing: true,
          force: true,
        }
      ],
    }),
    new CleanWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  ...devServer(development)
});
