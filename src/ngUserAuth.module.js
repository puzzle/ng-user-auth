(function () {
  'use strict';

  angular
    .module('ngUserAuth', [
      'ngUserAuth.config',
      'ngUserAuth.directive',
      'ngUserAuth.interceptor',
      'ngUserAuth.run',
      'ngUserAuth.service',
      'ngUserAuthInfo.service'
    ]);
})();
