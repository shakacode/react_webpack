// The source code including full typescript support is available at:
// https://github.com/shakacode/react_on_rails_tutorial_with_ssr_and_hmr_fast_refresh/blob/master/config/webpack/development.js

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const { devServer, inliningCss } = require('@rails/webpacker');

const webpackConfig = require('./webpackConfig');

const developmentEnvOnly = (clientWebpackConfig, _serverWebpackConfig) => {
  // eslint-disable-next-line no-unused-vars
  const isWebpackDevServer = process.env.WEBPACK_DEV_SERVER;

  // plugins
  if (inliningCss) {
    // Note, when this is run, we're building the server and client bundles in separate processes.
    // Thus, this plugin is not applied.

    // eslint-disable-next-line global-require
    const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
    clientWebpackConfig.plugins.push(new ReactRefreshWebpackPlugin({
      overlay: {
        sockPort: devServer.port,
      },
    }));
  }
};
module.exports = webpackConfig(developmentEnvOnly);
