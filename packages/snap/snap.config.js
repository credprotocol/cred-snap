const envify = require('envify/custom');
require('dotenv').config();

module.exports = {
  cliOptions: {
    src: './src/index.ts',
    port: 8080,
  },
  bundlerCustomizer: (bundler) => {
    bundler.transform(
      envify({
        CRED_API_TOKEN: process.env.CRED_API_TOKEN,
      }),
    );
  },
};
