/**
 * ng-user-auth 0.0.1
 * (c) 2015 Oliver Gugger
 * License: MIT
 */

(function() {
 'use strict';

  angular
    .module('ngUserAuth')
    .factory('ngUserAuthService', ngUaService);

  function ngUaService() {
   console.log("service");
   return {
     
   };
 }
})();
