import angular from 'angular';

import uirouter from 'angular-ui-router';
import lodash from 'lodash';
import localStorage from 'angular-local-storage';

import config from 'ngUserAuth.config.js';
import directive from 'ngUserAuth.directive.js';
import run from 'ngUserAuth.run.js';
import ngUserAuthInfoService from 'ngUserAuthInfoService.factory.js';
import ngUserAuthInterceptor from 'ngUserAuthInterceptor.factory.js';
import NgUserAuthServiceProvider from 'ngUserAuthService.provider.js';

export default angular
  .module('ngUserAuth', [uirouter, lodash, localStorage])
  .config(config)
  .run(run)
  .directive('ngUserAuth', directive)
  .factory('ngUserAuthInfoService', ngUserAuthInfoService)
  .factory('ngUserAuthInterceptor', ngUserAuthInterceptor)
  .provider('ngUserAuthService', NgUserAuthServiceProvider)
  .name;