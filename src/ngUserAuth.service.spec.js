/**
 * ng-user-auth 0.0.1
 * (c) 2015 Oliver Gugger
 * License: MIT
 */

 (function () {
   'use strict';

   describe('ngUserAuth', function () {

     var ngUserAuthService;

     /**
      * Global injects and setups
      */
     beforeEach(function () {
       module('ngUserAuth');

       inject(function ($injector) {
         ngUserAuthService = $injector.get('ngUserAuthService');
       });
     });

     describe('service', function () {

       it('should load the service', function () {
         expect(ngUserAuthService).toBeDefined();
       });
     });
   });
 })();
