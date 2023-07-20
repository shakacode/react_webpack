const commonWebpackConfig = require('./commonWebpackConfig');

const configureClient = () => {
  const clientConfig = commonWebpackConfig();

  // server-bundle is special and should ONLY be built by the serverConfig
  // In case this entry is not deleted, a very strange "window" not found
  // error shows referring to window["webpackJsonp"]. That is because the
  // client config is going to try to load chunks.
  delete clientConfig.entry['server-bundle'];

  // Override the runtimeChunk value to showcase the issue reported by
  // https://github.com/shakacode/react_on_rails/issues/1558
  clientConfig.optimization = {
    ...clientConfig.optimization,
    runtimeChunk: 'multiple',
  };

  return clientConfig;
};

module.exports = configureClient;
