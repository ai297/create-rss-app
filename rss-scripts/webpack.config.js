const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

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

const htmlFile = /^([-_\d\w]+).html$/i;
const makePath = (relativePath) => './' + relativePath.replace(/\\+/g, '/');

const getPages = (dir, n, getRelative, isUseTs) => {
  const dirContent = fs.readdirSync(dir);
  const pages = dirContent
    .filter(f => htmlFile.test(f))
    .reduce((res, f, i) => {
      const name = path.basename(f, path.extname(f));
      res.push({
        name: `p${n += i}`,
        dir: getRelative(dir),
        html: makePath(getRelative(path.join(dir, f))),
        script: dirContent.find(f => new RegExp(`^${name}\.${isUseTs?'t':'j'}s$`, 'i').test(f)),
        style: dirContent.find(f => new RegExp(`^${name}\.s(c|a)ss$`, 'i').test(f)),
      });
      return res;
    }, [])
    .concat(dirContent
      .filter(f => fs.lstatSync(path.resolve(dir, f)).isDirectory())
      .reduce((res, f) => [...res, ...getPages(path.resolve(dir, f), n + 1, getRelative, isUseTs)], [])
    );

  return pages;
};

const getEntryPoints = (pages) => pages.reduce((entry, {name, dir, script, style}) => Object.assign(entry,
  script ? { [name]: makePath(path.join(dir, script)) } : {},
  style ? { [`${name}-styles`]: makePath(path.join(dir, style)) } : {},
), {});

const getHtmlPlugins = (pages) => pages.map(({html, name, script, style}) => new HtmlWebpackPlugin({
  template: html,
  filename: html,
  chunks: [ script ? name : null, style ? `${name}-styles` : null ].filter(c => !!c),
}));

module.exports = ({ development, dirname, isUseTs }) => {
  const srcPath = path.resolve(dirname, 'src');
  const getRelative = (absolutePath) => path.relative(srcPath, absolutePath);
  const pages = getPages(srcPath, 1, getRelative, isUseTs);

  return {
    mode: development ? 'development' : 'production',
    devtool: development ? 'inline-source-map' : false,
    entry: getEntryPoints(pages),
    context: srcPath,
    output: {
      filename: 'js/[name].[contenthash].js',
      path: path.resolve(dirname, 'dist'),
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
          use: [{loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' }}, 'css-loader'],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [{loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' }}, 'css-loader', 'sass-loader']
        }
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' }),
      ...getHtmlPlugins(pages),
      new CopyPlugin({
        patterns: [
          {
            from: '**/*',
            context: srcPath,
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
  };
};
