module.exports = (baseConfig, env, defaultConfig) => {
  // make sure you have babel-loader@8 installed and @babel/core@7
  defaultConfig.module.rules[0].use[0].loader = require.resolve("babel-loader");

  // This reflect what presets you want webpack's babel loader to go through while transpiling your code
  // use @babel/preset-react for JSX and env (instead of staged presets)
  defaultConfig.module.rules[0].use[0].options.presets = [
    require.resolve("@babel/preset-react"),
    require.resolve("@babel/preset-env")
  ];

  return defaultConfig;
};
