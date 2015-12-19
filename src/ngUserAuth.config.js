(function () {
  'use strict';

  angular
    .module('ngUserAuth.config', [])
    .config(config);

  /** @ngInject */
  function config($httpProvider) {
    // register custom security interceptor
    $httpProvider.interceptors.push('ngUserAuthInterceptor');
  }
})();
