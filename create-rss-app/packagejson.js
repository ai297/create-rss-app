const fs = require('fs');
const path = require('path');
const template = require('./template/package.json');

const getScripts = (configs, useTs) => configs
  ? {
    start: 'webpack serve --env development',
    build: 'webpack',
  }
  : {
    start: `rss-scripts start${useTs ? ' -ts' : ''}`,
    build: `rss-scripts build${useTs ? ' -ts' : ''}`,
  };

const getDevDependencies = (useTs) => Object.assign(
  {
    'clean-webpack-plugin': '4.0.0-alpha.0',
    'copy-webpack-plugin': '8.1.1',
    'css-loader': '5.2.4',
    'html-webpack-plugin': '5.3.1',
    'mini-css-extract-plugin': '1.6.0',
    'sass': '1.32.12',
    'sass-loader': '11.0.1',
    'webpack': '5.36.2',
    'webpack-cli': '4.6.0',
    'webpack-dev-server': '4.1.1',
    'webpack-remove-empty-scripts': '0.7.1',
  }, useTs ? {
    'ts-loader': '9.2.3',
    'typescript': '4.3.5',
  } : {});

function getPackageJson(baseConfig, name, isNoConfigs, isUseTs) {
  baseConfig.name = baseConfig.name || name || 'my-new-app';
  baseConfig.scripts = baseConfig.scripts || {};
  baseConfig.scripts = Object.assign(baseConfig.scripts, getScripts(!isNoConfigs, isUseTs));

  if (isNoConfigs) return baseConfig;

  baseConfig.devDependencies = baseConfig.devDependencies || {};
  baseConfig.devDependencies = Object.assign(baseConfig.devDependencies, getDevDependencies(isUseTs));

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
