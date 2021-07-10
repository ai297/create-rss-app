const fs = require('fs');
const path = require('path');
const configPackageJson = require('./template/package.json');
const noConfigPackageJson = require('./template/no-config.package.json');

const getPackageJson = (projectName, isNoConfig = true) => {
  const packageJson = isNoConfig ? noConfigPackageJson : configPackageJson;
  packageJson.name = projectName;
  return packageJson;
};

const getProjectPaths = (projectName) => {
  const projectRoot = path.resolve(projectName);
  const projectSrc = path.join(projectRoot, 'src');
  const projectSrcImages = path.join(projectSrc, 'images');
  const removeProjectDir = () => fs.rmdirSync(projectRoot, { recursive: true, force: true });
  return {
    projectRoot,
    projectSrc,
    projectSrcImages,
    removeProjectDir,
  };
};

module.exports = {
  getPackageJson,
  getProjectPaths,
};
