import angular from 'angular';
import uaInfoService from './ngUserAuthInfoService.factory';

export default angular
  .module('ngUserAuth.directive', [
    uaInfoService,
  ])
  .directive('uaPermission', uaPermission)
  .directive('uaAnyPermission', uaAnyPermission)
  .directive('uaLacksPermission', uaLacksPermission)
  .name;

/** @ngInject */
function uaPermission($rootScope, ngUserAuthInfoService) {
  return {
    link: makeLinkFn($rootScope, ngUserAuthInfoService, 'uaPermission', ngUserAuthInfoService.userHasPermission),
  };
}

/** @ngInject */
function uaAnyPermission($rootScope, ngUserAuthInfoService) {
  return {
    link: makeLinkFn($rootScope, ngUserAuthInfoService, 'uaAnyPermission', ngUserAuthInfoService.userHasAnyPermission),
  };
}

/** @ngInject */
function uaLacksPermission($rootScope, ngUserAuthInfoService) {
  return {
    link: makeLinkFn($rootScope, ngUserAuthInfoService, 'uaLacksPermission', ngUserAuthInfoService.userLacksPermission),
  };
}

function makeLinkFn($rootScope, ngUserAuthInfoService, attrName, checkFn) {
  return function linkNgUserAuth(scope, element, attrs) {
    // make sure that there will never be a property on the scope that matches a role name by providing an
    // empty isolated scope. otherwise the $eval() might have side effects
    const evalScope = $rootScope.$new(true);
    const permissions = evalScope.$eval(attrs[attrName]) || attrs[attrName];

    // closure so we can re-calculate when permissions change
    function toggleVisibilityBasedOnPermission() {
      if (checkFn(permissions)) {
        element.show();
      } else {
        element.hide();
      }
    }

    toggleVisibilityBasedOnPermission();
    ngUserAuthInfoService.notifyOnAuthChange(toggleVisibilityBasedOnPermission);
  };
}
