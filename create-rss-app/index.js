#!/usr/bin/env node

'use strict';

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const out = require('./out');
const { getPackageJson, getProjectPaths } = require('./helpers');

const run = (cmd, ...args) => new Promise((res, rej) => {
  const chp = spawn(cmd, args, { shell: true });
  chp.stdout.on('data', (d) => console.log(d.toString()));
  chp.stderr.on('data', (d) => console.error(d.toString()));
  chp.on('error', (e) => rej(e.toString()));
  chp.on('close', (code) => code === 0 ? res() : rej());
});

(async function() {
  const args = process.argv.slice(2);
  const projectNameIndex = args.findIndex(v => /^[a-z0-9_]+[a-z0-9-_]{1,64}$/i.test(v));

  if (projectNameIndex < 0) return out.specifyProjectName();

  const flags = args.filter(v => /^-[-a-z]{2,10}$/i.test(v)).map(v => v.toLowerCase());
  const isConfigs = flags.includes('--configs') || flags.includes('-c');
  const isUseTs = flags.includes('--typescript') || flags.includes('-ts');

  const [ projectName ] = args.splice(projectNameIndex, 1);
  const templatePath = path.resolve(__dirname, 'template');
  const templateSrcPath = path.join(templatePath, 'src');
  const { projectRoot, projectSrc, projectSrcImages, removeProjectDir } = getProjectPaths(projectName);
  out.startProcessing();

  if(fs.existsSync(projectRoot)) {
    out.directoryExists(projectName);
    return 1;
  }

  // Create project directories.
  try {
    fs.mkdirSync(projectRoot);
    fs.mkdirSync(projectSrc);
    fs.mkdirSync(projectSrcImages);
    out.info('  + Directories created.');
  } catch {
    out.error('  - Failed to create directories.');
    return 1;
  }

  // Create package.json.
  try {
    fs.writeFileSync(
      path.join(projectRoot, 'package.json'),
      JSON.stringify(getPackageJson(projectName, !isConfigs), undefined, 2),
    );
    out.info('  + The package.json created.')
  } catch {
    out.error('  - Failed to create package.json');
    removeProjectDir();
    return 1;
  }

  // Create configs.
  if (isConfigs) try {
    fs.copyFileSync(path.join(templatePath, 'webpack.config.js'), path.join(projectRoot, 'webpack.config.js'));
  } catch {
    out.error('  - Failed to create webpack config...');
    removeProjectDir();
    return 1;
  }
  if (isConfigs || isUseTs) try {
    fs.copyFileSync(path.join(templatePath, 'tsconfig.json'), path.join(projectRoot, 'tsconfig.json'));
    fs.copyFileSync(path.join(templatePath, 'modules.d.ts'), path.join(projectRoot, 'modules.d.ts'));
  } catch {
    out.error('  - Failed to create tsconfig...');
    removeProjectDir();
    return 1;
  }
  out.info('  + Config files created.');

  // Copy template files.
  try {
    // fs.copyFileSync(path.join(templatePath, '.gitignore'), path.join(projectRoot, '.gitignore'));
    fs.copyFileSync(path.join(templateSrcPath, 'index.html'), path.join(projectSrc, 'index.html'));
    fs.copyFileSync(path.join(templateSrcPath, 'index.js'), path.join(projectSrc, isUseTs ? 'index.ts' : 'index.js'));
    fs.copyFileSync(path.join(templateSrcPath, 'style.css'), path.join(projectSrc, 'style.css'));
    fs.copyFileSync(path.join(templateSrcPath, 'images', 'lazy.png'), path.join(projectSrcImages, 'lazy.png'));
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

  out.successfullyCreated(projectName);
  return 0;
})().then(exitCode => process.exit(exitCode));
