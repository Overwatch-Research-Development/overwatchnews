module.exports = {
  stories: ['../../../packages/ui/**/*.stories.@(ts|tsx|mdx)'],
  features: {
    storyStoreV7: false,
  },
  addons: ['@storybook/addon-ondevice-controls'],
  docs: {
    autodocs: true,
  },
}
