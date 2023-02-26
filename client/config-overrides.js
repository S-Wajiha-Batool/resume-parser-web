const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const webpack = require('webpack')
module.exports = function override(config, env) {
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
          process: "process/browser",
          //Buffer: ["buffer", "Buffer"],
        }),
      ]);
    config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));
    config.resolve.fallback = {
        'process/browser': require.resolve('process/browser'),
        fs: false,
        child_process: false,
      }
    //   config.node = {
    //     global: true,
    //     __filename: true,
    //     __dirname: true,
    //   }
    return config;
};