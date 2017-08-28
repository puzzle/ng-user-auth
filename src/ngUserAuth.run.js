import angular from 'angular';
import uiRouter from 'angular-ui-router';
import lodashWrapper from './lodash.wrapper';
import uaService from './ngUserAuthService.provider';
import uaInfoService from './ngUserAuthInfoService.factory';

export default angular
  .module('ngUserAuth.run', [
    uiRouter,
    lodashWrapper,
    uaService,
    uaInfoService,
  ])
  .run(runBlock)
  .name;

/** @ngInject */
function runBlock($rootScope, lodash, ngUserAuthService, ngUserAuthInfoService, $state) {
  // implement permissions on ui-router
  $rootScope.$on('$stateChangeStart', handleStateChangeStart);

  // ////////

  function handleStateChangeStart(event, toState, toParams) {
    // if we do $state.go() later, a $stateChangeStart event will be fired again. but if we already handled the state,
    // we don't need to check it again and therefore prevent an infinite loop. and we don't need to check
    // anonymous states
    if (toState.data && toState.data.anonymousAccessAllowed) {
      return;
    }

    const stateParams = checkStateParams(toState);

    // something to check?
    if (stateParams.needsCheck) {
      // make sure we call the whenReady and that it will resolve
      ngUserAuthInfoService.whenReady().then(() => {
        const check = ngUserAuthInfoService.checkPermissions(
          stateParams.hasPermission,
          stateParams.hasAnyPermission,
          stateParams.lacksPermission);

        if (!ngUserAuthInfoService.isLoggedIn()) {
          ngUserAuthService.goToLoginScreen(toState);
        } else if (!check) {
          doRedirect(stateParams.redirectTo, toParams);
        } else if (event.defaultPrevented) {
          $state.go(toState.name, toParams);
        }
      }, () => $state.go('error', toParams));

      // when the promise was not immediately resolved, it means we aren't ready yet.
      // so we stop the default behaviour and wait for the promise to resolve
      if (!ngUserAuthInfoService.isReady() || !ngUserAuthInfoService.isLoggedIn()) {
        event.preventDefault();
      }
    }
  }

  function checkStateParams(state) {
    let hasPermission = [],
      hasAnyPermission,
      lacksPermission,
      redirectTo;
    if (state.data) {
      hasPermission = safeArray(state.data.hasPermission);
      hasAnyPermission = state.data.hasAnyPermission;
      lacksPermission = state.data.lacksPermission;
      redirectTo = state.data.redirectTo;
    }

    // anonymous access?
    if (!state || !state.data || !state.data.anonymousAccessAllowed) {
      hasPermission.push(ngUserAuthService.getDefaultLoggedInPermissionName());
    }

    return {
      hasPermission,
      hasAnyPermission,
      lacksPermission,
      redirectTo,
      needsCheck: (hasPermission.length > 0 || hasAnyPermission || lacksPermission),
    };
  }

  function safeArray(arrOrString) {
    if (!arrOrString) {
      return [];
    }

    if (!lodash.isArray(arrOrString)) {
      return [arrOrString];
    }

    return arrOrString;
  }

  function doRedirect(redirectTo, toParams) {
    let redirect = redirectTo;
    // if authorization was unsuccessful, try to redirect to somewhere
    if (redirect) {
      if (angular.isFunction(redirect)) {
        redirect = redirect();
      }

      return $state.go(redirect, toParams);
    }
    return $state.go('forbidden', toParams);
  }
}
