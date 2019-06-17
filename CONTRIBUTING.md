# Contributing

```bash
git clone https://github.com/vyushin/file-replace-loader
cd file-replace-loader/
npm i
npm run build_example_wp_4x
cd ./example/dist
node ./script.js
```

That should be message in terminal:

```bash
Message from replacement.js
```

This means that file replace loader works.

In `example/src` folder you can see example source code. Let's see on file `replacement.js`. 
This is file containing message above. File replace loader replaced `example/src/source.js` to `example/src/replacement.js` then webpack copied files to `example/dist` folder.
You can open `example/webpack.config.js` and see how file replace loader did it.

After each change `example/webpack.config.js` you should run `npm run build_example_wp_4x` or `npm run build_example_wp_3x`.
