import angular from 'angular';
import uirouter from 'angular-ui-router';

import config from 'ngUserAuth.config';
import directive from 'ngUserAuth.directive';
import run from 'ngUserAuth.run';
import ngUserAuthInfoService from 'ngUserAuthInfoService.factory';
import ngUserAuthInterceptor from 'ngUserAuthInterceptor.factory';
import NgUserAuthServiceProvider from 'ngUserAuthService.provider';

export default angular
  .module('ngUserAuth', [uirouter])
  .config(config)
  .run(run)
  .directive('ngUserAuth', directive)
  .factory('ngUserAuthInfoService', ngUserAuthInfoService)
  .factory('ngUserAuthInterceptor', ngUserAuthInterceptor)
  .provider('ngUserAuthService', NgUserAuthServiceProvider)
  .name;