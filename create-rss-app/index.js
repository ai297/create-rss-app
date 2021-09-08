#!/usr/bin/env node

'use strict';

const nodeVersion = process.versions.node.split('.')[0];

if (nodeVersion < 14) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Please update your version of Node.'
  );
  process.exit(1);
}

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const out = require('./out');
const createPackageJson = require('./packagejson');

const run = (cmd, ...args) => new Promise((res, rej) => {
  const chp = spawn(cmd, args, { shell: true });
  chp.stdout.on('data', (d) => console.log(d.toString()));
  chp.stderr.on('data', (d) => console.error(d.toString()));
  chp.on('error', (e) => rej(e.toString()));
  chp.on('close', (code) => code === 0 ? res() : rej());
});

(async function() {
  const args = process.argv.slice(2);
  const projectNameIndex = args.findIndex(v => /^[a-z0-9]+[a-z0-9-_]{1,64}$/i.test(v));
  const projectDirName = projectNameIndex < 0 ? '.' : args.splice(projectNameIndex, 1)[0];
  const projectRoot = path.resolve(projectDirName);
  const projectName = path.basename(projectRoot);
  const projectSrc = path.join(projectRoot, 'src');
  const projectSrcImages = path.join(projectSrc, 'images');
  const isNewDir = !fs.existsSync(projectRoot);
  const removeProjectDir = () => isNewDir ? fs.rmdirSync(projectRoot, { recursive: true, force: true }) : undefined;

  const flags = args.filter(v => /^-(-)?[a-z]{1,10}$/i.test(v)).map(v => v.toLowerCase());
  const isConfigs = flags.includes('--configs') || flags.includes('-c');
  const isUseTs = flags.includes('--typescript') || flags.includes('-ts');
  const isEmpty = flags.includes('--empty');

  const templatePath = path.resolve(__dirname, 'template');
  const templateSrcPath = path.join(templatePath, 'src');
  out.startProcessing();

  // Create project directories.
  try {
    if (isNewDir) fs.mkdirSync(projectRoot);
    if (!isEmpty && !fs.existsSync(projectSrc)) fs.mkdirSync(projectSrc);
    if (!isEmpty && !fs.existsSync(projectSrcImages)) fs.mkdirSync(projectSrcImages);
    out.info('  + Directories created.');
  } catch {
    out.error('  - Failed to create directories.');
    return 1;
  }

  // Create package.json.
  try {
    createPackageJson(projectRoot, projectName, !isConfigs, isUseTs);
    out.info('  + The package.json created.')
  } catch {
    out.error('  - Failed to create package.json');
    removeProjectDir();
    return 1;
  }

  // Create configs.
  if (isConfigs) {
    try {
      fs.copyFileSync(
        path.join(templatePath, isUseTs ? 'webpack.config.ts' : 'webpack.config.js'),
        path.join(projectRoot, 'webpack.config.js'),
      );
    } catch {
      out.error('  - Failed to create webpack config...');
      removeProjectDir();
      return 1;
    }
    out.info('  + Webpack config created.');
  }

  if (isUseTs) {
    try {
      fs.copyFileSync(path.join(templatePath, 'tsconfig.json'), path.join(projectRoot, 'tsconfig.json'));
      fs.copyFileSync(path.join(templatePath, 'modules.d.ts'), path.join(projectRoot, 'modules.d.ts'));
    } catch {
      out.error('  - Failed to create tsconfig...');
      removeProjectDir();
      return 1;
    }
    out.info('  + TS config created.');
  }

  if (!isUseTs) {
    try {
      fs.copyFileSync(path.join(templatePath, 'jsconfig.json'), path.join(projectRoot, 'jsconfig.json'));
    } catch {
      out.error('  - Failed to create jsconfig...');
      removeProjectDir();
      return 1;
    }
    out.info('  + JS config created.');
  }

  // Copy template files.
  if (!isEmpty) try {
    const indexFile = path.join(projectSrc, 'index.html');
    const scriptFile = path.join(projectSrc, isUseTs ? 'index.ts' : 'index.js');
    const styleFile = path.join(projectSrc, 'style.css');
    if (!fs.existsSync(indexFile) && !fs.existsSync(scriptFile)) {
      fs.copyFileSync(path.join(templateSrcPath, 'images', 'lazy.png'), path.join(projectSrcImages, 'lazy.png'));
    }
    if (!fs.existsSync(indexFile)) fs.copyFileSync(path.join(templateSrcPath, 'index.html'), indexFile);
    if (!fs.existsSync(scriptFile)) fs.copyFileSync(path.join(templateSrcPath, `index.${isUseTs ? 't' : 'j'}s`), scriptFile);
    if (!fs.existsSync(styleFile)) fs.copyFileSync(path.join(templateSrcPath, 'style.css'), styleFile);
    out.info('  + Template created.');
  } catch {
    out.error('  - Failed to create project files.');
    removeProjectDir();
    return 1;
  }

  // Insatall dependencies.
  out.installDependencies();
  try {
    process.chdir(projectRoot);
    const installProcess = isConfigs
      ? run('npm', 'i')
      : run('npm', 'i', 'rss-scripts', '--save-dev');
    await installProcess;
    out.info('  + Dependencies installed.');
  } catch {
    out.error('  - Failed to install dependencies.');
    removeProjectDir();
    return 1;
  }

  out.successfullyCreated(projectDirName);
  return 0;
})().then(exitCode => process.exit(exitCode));
