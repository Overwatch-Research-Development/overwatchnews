module.exports = function (api) {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
    plugins: [
      'react-native-reanimated/plugin',
      ...(process.env.EAS_BUILD_PLATFORM === 'android'
        ? []
        : [
          [
            '@tamagui/babel-plugin',
            {
              components: ['@my/ui', 'tamagui'],
              config: '../../packages/ui/src/tamagui.config.ts',
              disable: true
            },
          ],
        ]),
      [
        'transform-inline-environment-variables',
        {},
      ],
    ],
  }
}
