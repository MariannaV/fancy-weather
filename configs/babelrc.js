const path = require('path');
const root = path.resolve(__dirname, '../');
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: require(`${root}/package.json`).browserslist,
          // esmodules: true,
        },
        modules: false,
        loose: true,
        spec: true,
        useBuiltIns: 'usage',
        corejs: 3,
        forceAllTransforms: true,
        debug: false,
      },
    ],
  ],
};
