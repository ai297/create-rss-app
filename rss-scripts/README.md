# RSS Scripts
Webpack configuration for create-rss-app

## Usage
1. Install package as dev-dependency
```sh
npm install rss-scripts --save-dev
```
2. Add this scripts for package.json:
```json
"scripts": {
  "start": "rss-scripts start",
  "build": "rss-scripts build"
}
```
3. If you want to use TypeScript - add tsconfig.json to root folder of project.
4. Add your source code to `src` directory.
5. src dir has to contains index.html and index.js (or index.ts)
