const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const getEntryPoint = (isUseTs, projectDir) => isUseTs && fs.existsSync(path.join(projectDir, 'src', 'index.ts'))
  ? './index.ts'
  : './index.js';

const getTsConfigPath = (projectDir) => {
  const projectTsConfigPath = path.join(projectDir, 'tsconfig.json');
  return fs.existsSync(projectTsConfigPath)
    ? projectTsConfigPath
    : path.resolve(__dirname, './tsconfig.json');
};

const tsLoader = (isUseTs, projectDir) => isUseTs
  ? [{
    test: /\.[tj]s$/,
    loader: require.resolve('ts-loader'),
    options: {
      configFile: getTsConfigPath(projectDir),
    },
    exclude: /node_modules/,
  }]
  : [];

const devServer = (isDev, projectDir) => !isDev ? {} : {
  devServer: {
    open: true,
    port: 'auto',
    static: {
      directory: path.join(projectDir, 'src'),
      watch: true,
    },
  },
};

module.exports = ({ development, dirname, isUseTs }) => ({
  mode: development ? 'development' : 'production',
  devtool: development ? 'inline-source-map' : false,
  entry: getEntryPoint(isUseTs, dirname),
  context: path.join(dirname, 'src'),
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.join(dirname, 'dist'),
    assetModuleFilename: '[file]',
  },
  target: ['web', 'es6'],
  module: {
    rules: [
      ...tsLoader(isUseTs, dirname),
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
          context: path.resolve(dirname, './src'),
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
    extensions: isUseTs ? ['.ts', '.js'] : ['.js'],
  },
  ...devServer(development, dirname)
});
