# Create Rss App

CLI for create simple JS or TS project without webpack configuration

Easiest way to start use modules in your js app

## Quick start
```sh
npx create-rss-app my-app
cd my-app
npm start
```

## NPM Scripts
+ `npm start` - Starts the development server.
+ `npm run build` - Boundles your app into static files for deployment.

## About webpack configuration
This package use webpack with simpliest configuration.
+ You should place your source files to `src` folder in project directory. Includes styles, images, etc..
+ `src` folder should contains `index.html`
+ `src` folder should contains `index.js` or `index.ts` scripts - it will be entry point to your app.
+ If you want to use css files, you should add <link> tag to index.html. But you don't need add links for script files.
+ If you want to use scss or sass pre-processor - you should import this files into your scripts, like `import 'styles.scss';`
+ When you run `npm run build`, project bundle will be created in `dist` directory.

## Configs
You can use `--configs` of `-c` flags if you want to add webpack config to your project directory. It will give you more control.
```sh
npx create-rss-app my-app --configs
```

## TypeScript
This package use typescript compiller by default and you can code your app with both languages - JS and TS.

But if you want to code with TS (and don't want to eject configs) - you can use flags `--typescript` or `-ts` for add tsconfig.json to your project directory.
```sh
npx create-rss-app my-app -ts
```
