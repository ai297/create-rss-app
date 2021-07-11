const chalk = require('chalk');

const error = (message) => console.error(chalk.bold(chalk.red(message)));
const success = (message) => console.log(chalk.bold(chalk.green(message)));
const info = (message) => console.log(chalk.grey(message));
const def = (def = '', val = '') => console.log(chalk.blueBright(def), chalk.greenBright(val));
const newLine = (lines = 1, str = '') => lines > 0 && console.log(Array(lines - 1).fill(`${str}\n`).join(''));

const specifyProjectName = () => {
  error('You should specify the project directory.')
  info('For example:');
  def('    npx create-school-app', 'my-new-project');
  newLine();
};

const startProcessing = () => success('Createing a new simple js project...');
const directoryExists = (projectName) => error(`Cannot create ${projectName} directory because it's already exists.`);
const installDependencies = () => console.log('Installing packages... This might take a couple of minutes.');

const successfullyCreated = (projectName) => {
  newLine();
  success('Your new js project successfully created!');
  info(`Now, you can start hucking ;)`)
  newLine();
  def('  npm start');
  info('    Starts the development server.')
  newLine();
  def('  npm run build');
  info('    Boundles your app into static files for deployment.');
  newLine(2);
  info(`  But before, you should go to project dir: ${chalk.yellow('cd ' + projectName)}`)
  success('  Good luck!');
  newLine();
};

module.exports = {
  error,
  info,
  success,
  specifyProjectName,
  startProcessing,
  directoryExists,
  installDependencies,
  successfullyCreated,
}
