# Contributing

To execute examples I recommend using "Git Bash" (or similar).<br/>
Terminals like "Windows PowerShell", "Windows CMD" don't support.

To start contributing the project please fork the repository.

## Install

```bash
# Clone repository and install dependencies
git clone {url to forked repository}
cd file-replace-loader/
npm install
```

## Build
To build file-replace-loader I wrote script `transform.js`.<br/>
This script transforms source code to compatible with Node.js >=4.3.0 JavaScript (most compatibility). After transformation the script places the code in `dist` folder.

```bash
# Build file-replace-loader
npm run transform
```

## Build and run examples
file-replace-loader supports Webpack 3.x and Webpack 4.x, so I wrote two examples which are located in `example/3x` and `example/4x` directories. They have identical build command. You can build and run they in the same way.

```bash
cd ./example/4x
npm install
npm run build
cd ./dist
node scripts.js
```

That should be message in terminal:

```bash
Message from replacement.js
Message from replacement-a.js
Message from replacement-b.js
```

This means that file-replace-loader works.

**NOTE:** Example dependencies has link to **local** file-replace-loader.<br/>
Look in `example/[3x|4x]/package.json`:

```json
{
  "devDependencies": {
    "file-replace-loader": "file:../../"
  }
}
```

This is a guarantee that in examples uses actual version (during development too).

## Sources
 Source code is located in `src` directory. <br/>
This is the main code of file-replace-loader.<br/>
After some changes you should run `npm run transform` then checking how file-replace-loader works in `example/[3x|4x]/`.

## Pull request

I don't have strict requirement of pull request. <br/>
Just write what you did. Thank you! :)