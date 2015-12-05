/**
 * ng-user-auth 0.0.1
 * (c) 2015 Oliver Gugger
 * License: MIT
 */

(function() {
 'use strict';

  angular
    .module('ngUserAuth', [])
    .run(ngUaRun);

  function ngUaRun() {
    console.log("running");
  }
})();
