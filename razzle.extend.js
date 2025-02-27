const path = require('path');
const plugins = (defaultPlugins) => {
  return defaultPlugins;
};
const modify = (config) => {
  const themeConfigPath = `${__dirname}/theme/theme.config`;
  config.resolve.alias['../../theme.config$'] = themeConfigPath;
  config.resolve.alias['../../theme.config'] = themeConfigPath;

  config.resolve.alias['../../theme'] = `${__dirname}/theme`;

  return config;
};

module.exports = {
  plugins,
  modify,
};
