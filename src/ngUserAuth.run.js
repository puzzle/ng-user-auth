(function () {
  'use strict';

  angular
    .module('ngUserAuth')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, lodash, ngUserAuthService, ngUserAuthInfoService, $state) {

    // implement permissions on ui-router
    $rootScope.$on('$stateChangeStart', handleStateChangeStart);

    //////////

    function handleStateChangeStart(event, toState, toParams) {
      // if we do $state.go() later, a $stateChangeStart event will be fired again. but if we already handled the state,
      // we don't need to check it again and therefore prevent an infinite loop. and we don't need to check
      // anonymous states
      if (toState.data && toState.data.anonymousAccessAllowed) {
        return;
      }

      var stateParams = checkStateParams(toState);

      // something to check?
      if (stateParams.needsCheck) {

        // make sure we call the whenReady and that it will resolve
        ngUserAuthInfoService.whenReady().then(function () {

          var check = ngUserAuthInfoService.checkPermissions(
            stateParams.hasPermission,
            stateParams.hasAnyPermission,
            stateParams.lacksPermission);

          if (!ngUserAuthInfoService.isLoggedIn()) {
            ngUserAuthService.goToLoginScreen();
          } else if (!check) {
            doRedirect(stateParams.redirectTo, toParams);
          } else {
            if (event.defaultPrevented) {
              $state.go(toState.name, toParams);
            }
          }
        }, function () {
          doRedirect(stateParams.redirectTo, toParams);
        });

        // when the promise was not immediately resolved, it means we aren't ready yet.
        // so we stop the default behaviour and wait for the promise to resolve
        if (!ngUserAuthInfoService.isReady() || !userAuthInfoService.isLoggedIn()) {
          event.preventDefault();
        }
      }
    }

    function checkStateParams(state) {
      var hasPermission = [], hasAnyPermission, lacksPermission, redirectTo;
      if (state.data) {
        hasPermission = safeArray(state.data.hasPermission);
        hasAnyPermission = state.data.hasAnyPermission;
        lacksPermission = state.data.lacksPermission;
        redirectTo = state.data.redirectTo;
      }

      // anonymous access?
      if (!state || !state.data || !state.data.anonymousAccessAllowed) {
        hasPermission.push(ngUserAuthInfoService.DEFAULT_LOGGED_IN_PERMISSION_NAME);
      }

      return {
        hasPermission: hasPermission,
        hasAnyPermission: hasAnyPermission,
        lacksPermission: lacksPermission,
        redirectTo: redirectTo,
        needsCheck: (hasPermission.length > 0 || hasAnyPermission || lacksPermission)
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
      // if authorization was unsuccessful, try to redirect to somewhere
      if (redirectTo) {
        if (angular.isFunction(redirectTo)) {
          redirectTo = redirectTo();
        }

        return $state.go(redirectTo, toParams);
      } else {
        return $state.go('forbidden', toParams);
      }
    }
  }
})();
