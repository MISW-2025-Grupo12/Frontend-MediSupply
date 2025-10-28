module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage')
    ],
    customLaunchers: {
      ChromeHeadless: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      }
    },
    browsers: ['ChromeHeadless'],
    reporters: ['progress', 'kjhtml']
  });
};

