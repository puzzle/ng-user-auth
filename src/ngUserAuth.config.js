import angular from 'angular';
import uaInterceptor from './ngUserAuthInterceptor.factory';

export default angular
  .module('ngUserAuth.config', [
    uaInterceptor,
  ])
  .config(config)
  .name;

/** @ngInject */
function config($httpProvider) {
  // register custom security interceptor
  $httpProvider.interceptors.push('ngUserAuthInterceptor');
}
