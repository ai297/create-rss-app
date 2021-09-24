# Create Rss App

<img alt="I'm lazy" align="right" src="https://user-images.githubusercontent.com/57856125/125196023-e912e700-e260-11eb-9190-459a60a17aad.png" width="20%" />

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
--------------

## About webpack configuration
This package use webpack with simpliest configuration.
+ You should place your source files to `src` folder in project directory. Includes styles, images, etc..
+ `src` folder should contains `index.html`
+ `src` folder should contains `index.js` (or `index.ts` if TypeScript is used) - it will be entry point to your app.
+ If you want to use css files, you should add &lt;link> tag to index.html. But you don't need add links for script files.
+ If you want to use **scss** or **sass** pre-processor - you should import this files into your scripts, like `import 'styles.scss';`. **But**, if your scss/sass file and html have a same name (like `index.html` and `index.scss`), &lt;link> tag will be added to html automatically, you don't need to use import in js (but you still need to add links to **css** manually).
+ This configuration supports multi-page apps. You can add a few html files to your project, it will work. Make js file with the same name and in the same directory, and it will automatically used as entrypoint for this html page.
+ When you run `npm run build`, project bundle will be created in `dist` directory.
--------------

## Options 
You can configure options by using different flags.

### Add configs
You can use `--configs` or `-c` flags if you want to add webpack config to your project directory. It will give you more control.
```sh
npx create-rss-app my-app --configs
```

### Use TypeScript
This package use typescript compiller by default and you can code your app with both languages - JS and TS.

But if you want to code with TS (and don't want to eject configs) - you can use flags `--typescript` or `-ts` for add tsconfig.json to your project directory.
```sh
npx create-rss-app my-app -ts
```
### Boilerplate
By default, create-rss-app add simple example of html, css and js files to your project, if there are not exists. But, if you don't need it, use the flag `--empty`.
