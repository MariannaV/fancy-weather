const path = require('path'),
  root = path.resolve(__dirname, '../../');

module.exports = {
  extends: [
    'stylelint-config-recommended-scss',
    'stylelint-config-airbnb',
    'stylelint-config-standard',
    'stylelint-config-prettier',
  ],
  plugins: [
    'stylelint-scss',
    'stylelint-order',
    'stylelint-declaration-block-no-ignored-properties',
    'stylelint-high-performance-animation',
    'stylelint-no-unsupported-browser-features',
    'stylelint-declaration-use-variable',
  ],
  rules: {
    'plugin/declaration-block-no-ignored-properties': true,
    'plugin/no-low-performance-animation-properties': [
      true,
      { ignoreProperties: ['color', 'background-color', 'border-color'] },
    ],
    'plugin/no-unsupported-browser-features': [
      true,
      {
        browsers: require(`${root}/package.json`).browserslist,
        severity: 'warning',
      },
    ],
    /*'sh-waqar/declaration-use-variable': [['/color/', /!*'font-size',*!/ /!*"z-index"*!/
      { ignoreValues: ['inherit', 'transparent', 'currentColor'] },
    ]],*/
    'order/order': ['custom-properties', 'dollar-variables', 'declarations', 'at-rules', 'rules'],
    'order/properties-alphabetical-order': true,
    'selector-type-no-unknown': [true, { ignore: ['custom-elements'] }],
    'block-no-empty': null,
    'at-rule-no-unknown': null,
    'max-nesting-depth': null,
    'no-descending-specificity': null,
    'no-missing-end-of-source-newline': null,
    'comment-empty-line-before': null,
    'comment-whitespace-inside': null,
    'selector-max-id': null,
  },
};
