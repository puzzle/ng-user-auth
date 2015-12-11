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

  function sampleConfig($urlRouterProvider, $stateProvider) {

    // Default URL if no other matches
    $urlRouterProvider.otherwise('/home');

    $stateProvider
      .state('home', {
        url: '/home',
        template: '<h1>Home</h1>'
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
        templateUrl: 'pages/login.html',
        controller: 'LoginController',
        controllerAs: 'vm',
        data: {
          anonymousAccessAllowed: true
        }
      })
      .state('logout', {
        url: '/logout',
        templateUrl: 'pages/login.html',
        controller: 'LoginController',
        controllerAs: 'vm',
        data: {
          anonymousAccessAllowed: true
        },
        params: {
          doLogout: {
            value: true
          }
        }
      })
      .state('unauthorized', {
        url: '/unauthorized?requestedPath',
        templateUrl: 'pages/login.html',
        controller: 'LoginController',
        controllerAs: 'vm',
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
