(function () {
  'use strict';

  angular
    .module('ngUserAuth')
    .factory('ngUserAuthInfoService', ngUserAuthInfoService);

  /** @ngInject */
  function ngUserAuthInfoService($q, ngUserAuthService, $rootScope, lodash) {

    // user and session information
    var loggedIn, user, userPermissions, readyPromise;

    var DEFAULT_LOGGED_IN_PERMISSION_NAME = 'token_read';

    // trigger initial load
    loggedIn = ngUserAuthService.isLoggedIn();
    $rootScope.$on(ngUserAuthService.LOGIN_STATE_CHANGED_EVENT_NAME, function (event, isLoggedIn) {
      loggedIn = isLoggedIn;
    });

    // expose the user to the root scope
    readyPromise = $q.defer();
    ngUserAuthService.getUserAuthInfo().then(setAuthInfo);
    notifyOnAuthChange(setAuthInfo);

    var service = {
      notifyOnAuthChange: notifyOnAuthChange,
      isLoggedIn: isLoggedIn,
      ready: ready,
      getUser: getUser,
      userBelongsTo: userBelongsTo,
      userHasPermission: hasPermission,
      userHasAnyPermission: hasAnyPermission,
      userLacksPermission: lacksPermission,
      checkPermissions: checkPermissions,
      DEFAULT_LOGGED_IN_PERMISSION_NAME: DEFAULT_LOGGED_IN_PERMISSION_NAME
    };

    return service;

    ////////////

    function notifyOnAuthChange(fn) {
      $rootScope.$on(ngUserAuthService.AUTH_INFO_CHANGED_EVENT_NAME, function (event, authInfo) {
        fn(authInfo);
      });
    }

    function isLoggedIn() {
      return loggedIn;
    }

    function ready() {
      return readyPromise.promise;
    }

    function getUser() {
      return user;
    }

    function setAuthInfo(authInfo) {
      // signal everybody who wants to know that we're ready
      readyPromise.resolve();

      user = authInfo.user;
      userPermissions = authInfo.permissions;
    }

    function userBelongsTo(type) {
      return user.type === type;
    }

    function hasPermission(requiredPermissions) {
      var permissions = sanitizePermissionArray(requiredPermissions);

      if (permissions.length === 0) {
        return true;
      } else {
        return allPermissionsPresent(permissions);
      }
    }

    function hasAnyPermission(requiredPermissions) {
      var permissions = sanitizePermissionArray(requiredPermissions);

      if (permissions.length === 0) {
        return true;
      } else {
        return somePermissionsPresent(permissions);
      }
    }

    function lacksPermission(forbiddenPermissions) {
      var permissions = sanitizePermissionArray(forbiddenPermissions);

      if (permissions.length === 0) {
        return true;
      } else {
        return !somePermissionsPresent(permissions);
      }
    }

    function allPermissionsPresent(permissions) {
      return lodash.every(permissions, function (value) {
        return lodash.includes(userPermissions, value);
      });
    }

    function somePermissionsPresent(permissions) {
      return lodash.some(permissions, function (value) {
        return lodash.includes(userPermissions, value);
      });
    }

    function sanitizePermissionArray(permissionArray) {
      if (permissionArray === undefined || lodash.isEmpty(permissionArray)) {
        return [];
      }

      if (!lodash.isArray(permissionArray)) {
        return [permissionArray];
      }

      return permissionArray;
    }

    function checkPermissions(checkHasPermission, checkHasAnyPermission, checkLacksPermission, isUserType) {
      var checkOk = true;

      // hide if user does not have all required permissions
      if (!hasPermission(checkHasPermission)) {
        checkOk = false;
      }

      // hide if user does not have at least one of the permissions
      if (!hasAnyPermission(checkHasAnyPermission)) {
        checkOk = false;
      }

      // hide if user does have some of the forbidden permissions
      if (!lacksPermission(checkLacksPermission)) {
        checkOk = false;
      }

      // hide if user is not of given user type
      if (!lodash.isEmpty(isUserType) && lodash.isString(isUserType) && !userBelongsTo(isUserType)) {
        checkOk = false;
      }

      return checkOk;
    }
  }
})();
