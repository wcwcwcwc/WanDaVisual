module.exports = function (api) {
  api.cache(true);

  const presets = [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['ie>=11', 'chrome>=49'],
          node: 6
        },
        debug: false,
        useBuiltIns: 'usage',
        corejs: '2.5.7' //声明`core-js`版本号
      }
    ]
  ];

  const plugins = [
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import', //支持`import()`动态导入
    '@babel/plugin-transform-flow-strip-types',
    'lodash',
    [
      // import glsl as raw text
      'babel-plugin-inline-import',
      {
        extensions: [
          // 由于使用了 TS 的 resolveJsonModule 选项，JSON 可以直接引入，不需要当作纯文本
          // '.json',
          '.glsl'
        ]
      }
    ]
  ];

  return {
    presets,
    plugins
  };
};
