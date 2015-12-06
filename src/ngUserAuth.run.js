(function () {
  'use strict';

  angular
    .module('ngUserAuth')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, lodash, ngUserAuthInfoService, $state) {

    // implement permissions on ui-router
    $rootScope.$on('$stateChangeStart', handleStateChangeStart);

    //////////

    function handleStateChangeStart(event, toState, toParams, fromState, fromParams) {
      // if we do $state.go() later, a $stateChangeStart event will be fired again. but if we already handled the state,
      // we don't need to check it again and therefore prevent an infinite loop. and we don't need to check
      // anonymous states
      if (toState.$$finishAuthorize || (toState.data && toState.data.anonymousAccessAllowed)) {
        return;
      }

      var stateParams = checkStateParams(toState);

      // something to check?
      if (stateParams.needsCheck) {
        event.preventDefault();
        toState = angular.extend({'$$finishAuthorize': true}, toState);

        ngUserAuthInfoService.ready().then(function () {
          var check = ngUserAuthInfoService.checkPermissions(
            stateParams.hasPermission,
            stateParams.hasAnyPermission,
            stateParams.lacksPermission,
            stateParams.isUserType);

          if (check) {
            doAllowStateChange(toState, toParams, fromState, fromParams);
          } else {
            doRedirect(stateParams.redirectTo, toParams);
          }
        });
      }
    }

    function checkStateParams(state) {
      var hasPermission = [], hasAnyPermission, lacksPermission, isUserType, redirectTo;
      if (state.data) {
        hasPermission = safeArray(state.data.hasPermission);
        hasAnyPermission = state.data.hasAnyPermission;
        lacksPermission = state.data.lacksPermission;
        isUserType = state.data.isUserType;
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
        isUserType: isUserType,
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

    function doAllowStateChange(toState, toParams, fromState, fromParams) {
      // don't notify automatically, we need to pass the changed toState object to the event when firing it
      $state.go(toState.name, toParams, {notify: false}).then(function () {
        $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
      });
    }

    function doRedirect(redirectTo, toParams) {
      // if authorization was unsuccessful, try to redirect to somewhere
      if (redirectTo) {
        if (angular.isFunction(redirectTo)) {
          redirectTo = redirectTo();
        }

        $state.go(redirectTo, toParams);
      } else {
        $state.go('forbidden', toParams);
      }
    }
  }
})();
