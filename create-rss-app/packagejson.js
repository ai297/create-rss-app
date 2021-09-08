const fs = require('fs');
const path = require('path');
const template = require('./template/package.json');

const noConfig = {
  scripts: {
    start: 'rss-scripts start',
    build: 'rss-scripts build',
  }
};

const common = {
  scripts: {
    start: 'webpack serve --env development',
    build: 'webpack'
  },
  devDependencies: {
    'clean-webpack-plugin': '^4.0.0-alpha.0',
    'copy-webpack-plugin': '^8.1.1',
    'css-loader': '^5.2.4',
    'html-webpack-plugin': '^5.3.1',
    'mini-css-extract-plugin': '^1.6.0',
    'sass': '^1.32.12',
    'sass-loader': '^11.0.1',
    'webpack': '^5.36.2',
    'webpack-cli': '^4.6.0',
    'webpack-dev-server': '^4.1.1'
  }
};

const babel = {
  devDependencies: {
    '@babel/core': '^7.15.5',
    '@babel/plugin-transform-runtime': '^7.15.0',
    '@babel/preset-env': '^7.15.4',
    'babel-loader': '^8.2.2',
  },
  dependencies: {
    '@babel/runtime': '^7.15.4'
  }
};

const typescript = {
  devDependencies: {
    'ts-loader': '^9.2.3',
    'typescript': '^4.3.5',
  }
};

function getPackageJson(baseConfig, name, isNoScript, isUseTs) {
  baseConfig.name = baseConfig.name || name || 'my-new-app';
  baseConfig.scripts = baseConfig.scripts || {};

  if (isNoScript) {
    baseConfig.scripts = Object.assign(baseConfig.scripts, noConfig.scripts);
    return baseConfig;
  }

  baseConfig.devDependencies = baseConfig.devDependencies || {};
  baseConfig.dependencies = baseConfig.dependencies || {};
  baseConfig.scripts = Object.assign(baseConfig.scripts, common.scripts);
  baseConfig.devDependencies = Object.assign(baseConfig.devDependencies, common.devDependencies);
  baseConfig.devDependencies = isUseTs
    ? Object.assign(baseConfig.devDependencies, typescript.devDependencies)
    : Object.assign(baseConfig.devDependencies, babel.devDependencies);
  baseConfig.dependencies = isUseTs
    ? baseConfig.dependencies
    : Object.assign(baseConfig.dependencies, babel.dependencies);

  return baseConfig;
}

function createPackageJson(projectRoot, projectName, isNoScript, isUseTs) {
  const filePath = path.join(projectRoot, 'package.json');
  const baseConfig = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
    : template;
  fs.writeFileSync(filePath, JSON.stringify(
    getPackageJson(baseConfig, projectName, isNoScript, isUseTs), undefined, 2));
}

module.exports = createPackageJson;
