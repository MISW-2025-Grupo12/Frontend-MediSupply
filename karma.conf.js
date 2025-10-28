// Minimal karma configuration for Angular 20+
module.exports = function (config) {
  config.set({
    // Timeout settings to prevent disconnection errors
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    captureTimeout: 60000,
    
    // Chrome configuration for CI
    customLaunchers: {
      ChromeHeadless: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote'
        ]
      }
    }
  });
};

