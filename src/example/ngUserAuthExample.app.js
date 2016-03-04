import angular from 'angular';

import uirouter from 'angular-ui-router';
import ngUserAuth from '../ngUserAuth/ngUserAuth.module';
import loginDirective from 'pages/login.directive';
import logoutDirective from 'pages/logout.directive';

export default angular
  .module('ngUserAuthExample', [
    uirouter,
    ngUserAuth
  ])
  .config(exampleConfig)
  .run(exampleRun)
  .directive('login', loginDirective)
  .directive('logout', logoutDirective)
  .name;

function exampleConfig($urlRouterProvider, $stateProvider, ngUserAuthServiceProvider) {

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

function exampleRun($rootScope, ngUserAuthService, ngUserAuthInfoService) {
  $rootScope.authService = ngUserAuthService;
  $rootScope.authInfoService = ngUserAuthInfoService;
}