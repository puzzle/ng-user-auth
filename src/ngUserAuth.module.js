import angular from 'angular';
import lodashWrapper from './lodash.wrapper';
import uaConfig from './ngUserAuth.config';
import uaDirective from './ngUserAuth.directive';
import uaRun from './ngUserAuth.run';
import uaInfoService from './ngUserAuthInfoService.factory';
import uaInterceptor from './ngUserAuthInterceptor.factory';
import uaService from './ngUserAuthService.provider';

export default angular
  .module('ngUserAuth', [
    lodashWrapper,
    uaConfig,
    uaDirective,
    uaInterceptor,
    uaRun,
    uaService,
    uaInfoService,
  ])
  .name;

