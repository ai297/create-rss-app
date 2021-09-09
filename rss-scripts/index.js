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
const dirname = `dirname="${projectRoot}"`;

const getEnv = (flags) => {
  const env = [ dirname ];
  if (flags.includes('-ts')) env.push('isUseTs=true');
  return env;
};

const scripts = {
  start: (flags) => run('npx', 'webpack', 'serve', '--env', 'development=true', ...getEnv(flags)),
  build: (flags) => run('npx', 'webpack', '--env', ...getEnv(flags)),
};

const [ script, ...flags ] = process.argv.slice(2).map(s => s.toLowerCase());
if (!script || !scripts[script]) process.exit(1);

process.chdir(__dirname);
scripts[script](flags)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
