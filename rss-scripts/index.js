#!/usr/bin/env node

'use strict';

const path = require('path');
const { spawn } = require('child_process');

const run = (cmd, ...args) => new Promise((res, rej) => {
  const chp = spawn(cmd, args, { shell: true });
  chp.stdout.on('data', (d) => console.log(d.toString()));
  chp.stderr.on('data', (d) => console.error(d.toString()));
  chp.on('error', (e) => rej(e.toString()));
  chp.on('close', (code) => code === 0 ? res() : rej());
});

const projectRoot = path.resolve();
const dirname = `dirname=${projectRoot}`;

const scripts = {
  start: () => run('npx', 'webpack', 'serve', '--env', 'development=true', dirname),
  build: () => run('npx', 'webpack', '--env', dirname),
};

const [ script ] = process.argv.slice(2);
if (!script || !scripts[script]) process.exit(1);

process.chdir(__dirname);
scripts[script]()
  ?.then(() => process.exit(0))
  .catch(() => process.exit(1));
