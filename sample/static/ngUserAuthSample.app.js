(function () {
  'use strict';

  angular
    .module('ngUserAuthSample', [
      'ui.router',
      'ngLodash',
      'LocalStorageModule',
      'ngUserAuth'
    ])
    .config(sampleConfig)
    .run(sampleRun);

  function sampleConfig($urlRouterProvider, $stateProvider, ngUserAuthServiceProvider) {

    ngUserAuthServiceProvider.setAbortRequestsUrlPrefix('/authentication');

    // Default URL if no other matches
    $urlRouterProvider.otherwise('/home');

    $stateProvider
      .state('home', {
        url: '/home',
        template: '<h1>Home</h1><a ui-sref="logout()">Logout</a>'
      })
      .state('forbidden', {
        url: '/forbidden',
        template: '<h1>Forbidden</h1>',
        data: {
          anonymousAccessAllowed: true
        }
      })
      .state('login', {
        url: '/login',
        template: '<login></login>',
        data: {
          anonymousAccessAllowed: true
        }
      })
      .state('logout', {
        url: '/logout',
        template: '<logout></logout>',
        data: {
          anonymousAccessAllowed: true
        }
      })
      .state('unauthorized', {
        url: '/unauthorized?requestedPath',
        template: '<login></login>',
        data: {
          anonymousAccessAllowed: true
        },
        params: {
          requestedPath: {
            value: null,
            squash: true
          }
        }
      });
  }

  function sampleRun($rootScope, ngUserAuthService, ngUserAuthInfoService) {
    $rootScope.authService = ngUserAuthService;
    $rootScope.authInfoService = ngUserAuthInfoService;
  }
})();
